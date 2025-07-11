from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from enum import Enum
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Sistema de Estacionamento AGC-24h", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ParkingSpotStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class ParkingSpotType(str, Enum):
    REGULAR = "regular"
    PREMIUM = "premium"
    DISABLED = "disabled"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class VehicleType(str, Enum):
    CAR = "car"
    MOTORCYCLE = "motorcycle"
    TRUCK = "truck"

# Models
class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    license_plate: str
    model: str
    color: str
    vehicle_type: VehicleType
    owner_name: str
    owner_phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VehicleCreate(BaseModel):
    license_plate: str
    model: str
    color: str
    vehicle_type: VehicleType
    owner_name: str
    owner_phone: str

class ParkingSpot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: str
    status: ParkingSpotStatus
    spot_type: ParkingSpotType
    hourly_rate: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ParkingSpotCreate(BaseModel):
    number: str
    spot_type: ParkingSpotType
    hourly_rate: float

class ParkingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    spot_id: str
    entry_time: datetime = Field(default_factory=datetime.utcnow)
    exit_time: Optional[datetime] = None
    total_hours: Optional[float] = None
    total_amount: Optional[float] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ParkingSessionCreate(BaseModel):
    vehicle_id: str
    spot_id: str

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    amount: float
    status: TransactionStatus
    payment_method: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TransactionCreate(BaseModel):
    session_id: str
    amount: float
    payment_method: str

class DashboardStats(BaseModel):
    total_spots: int
    occupied_spots: int
    available_spots: int
    maintenance_spots: int
    active_sessions: int
    daily_revenue: float
    monthly_revenue: float

# Utility functions
def calculate_parking_fee(entry_time: datetime, exit_time: datetime, hourly_rate: float) -> tuple:
    """Calculate parking fee and hours"""
    duration = exit_time - entry_time
    hours = duration.total_seconds() / 3600
    # Minimum 1 hour charge
    billable_hours = max(1, round(hours, 2))
    total_amount = billable_hours * hourly_rate
    return billable_hours, total_amount

# Routes

# Vehicle Management
@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate):
    """Registrar novo veículo"""
    # Check if license plate already exists
    existing = await db.vehicles.find_one({"license_plate": vehicle.license_plate})
    if existing:
        raise HTTPException(status_code=400, detail="Placa já cadastrada")
    
    vehicle_dict = vehicle.dict()
    vehicle_obj = Vehicle(**vehicle_dict)
    await db.vehicles.insert_one(vehicle_obj.dict())
    return vehicle_obj

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles():
    """Listar todos os veículos"""
    vehicles = await db.vehicles.find().to_list(1000)
    return [Vehicle(**vehicle) for vehicle in vehicles]

@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    """Obter veículo por ID"""
    vehicle = await db.vehicles.find_one({"id": vehicle_id})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return Vehicle(**vehicle)

@api_router.get("/vehicles/plate/{license_plate}", response_model=Vehicle)
async def get_vehicle_by_plate(license_plate: str):
    """Obter veículo por placa"""
    vehicle = await db.vehicles.find_one({"license_plate": license_plate})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return Vehicle(**vehicle)

# Parking Spot Management
@api_router.post("/spots", response_model=ParkingSpot)
async def create_parking_spot(spot: ParkingSpotCreate):
    """Criar nova vaga"""
    # Check if spot number already exists
    existing = await db.spots.find_one({"number": spot.number})
    if existing:
        raise HTTPException(status_code=400, detail="Número da vaga já existe")
    
    spot_dict = spot.dict()
    spot_dict["status"] = ParkingSpotStatus.AVAILABLE
    spot_obj = ParkingSpot(**spot_dict)
    await db.spots.insert_one(spot_obj.dict())
    return spot_obj

@api_router.get("/spots", response_model=List[ParkingSpot])
async def get_parking_spots():
    """Listar todas as vagas"""
    spots = await db.spots.find().to_list(1000)
    return [ParkingSpot(**spot) for spot in spots]

@api_router.get("/spots/available", response_model=List[ParkingSpot])
async def get_available_spots():
    """Listar vagas disponíveis"""
    spots = await db.spots.find({"status": ParkingSpotStatus.AVAILABLE}).to_list(1000)
    return [ParkingSpot(**spot) for spot in spots]

@api_router.put("/spots/{spot_id}/status")
async def update_spot_status(spot_id: str, status: ParkingSpotStatus):
    """Atualizar status da vaga"""
    result = await db.spots.update_one(
        {"id": spot_id}, 
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    return {"message": "Status da vaga atualizado"}

# Parking Session Management
@api_router.post("/sessions", response_model=ParkingSession)
async def create_parking_session(session: ParkingSessionCreate):
    """Registrar entrada de veículo"""
    # Verify vehicle exists
    vehicle = await db.vehicles.find_one({"id": session.vehicle_id})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # Verify spot exists and is available
    spot = await db.spots.find_one({"id": session.spot_id})
    if not spot:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    
    if spot["status"] != ParkingSpotStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Vaga não está disponível")
    
    # Check if vehicle already has an active session
    active_session = await db.sessions.find_one({
        "vehicle_id": session.vehicle_id,
        "is_active": True
    })
    if active_session:
        raise HTTPException(status_code=400, detail="Veículo já possui sessão ativa")
    
    # Create session
    session_dict = session.dict()
    session_obj = ParkingSession(**session_dict)
    await db.sessions.insert_one(session_obj.dict())
    
    # Update spot status
    await db.spots.update_one(
        {"id": session.spot_id},
        {"$set": {"status": ParkingSpotStatus.OCCUPIED}}
    )
    
    return session_obj

@api_router.put("/sessions/{session_id}/exit")
async def exit_parking_session(session_id: str):
    """Registrar saída de veículo"""
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    if not session["is_active"]:
        raise HTTPException(status_code=400, detail="Sessão já foi finalizada")
    
    # Get spot info for rate calculation
    spot = await db.spots.find_one({"id": session["spot_id"]})
    
    # Calculate fee
    exit_time = datetime.utcnow()
    entry_time = session["entry_time"]
    total_hours, total_amount = calculate_parking_fee(entry_time, exit_time, spot["hourly_rate"])
    
    # Update session
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {
            "exit_time": exit_time,
            "total_hours": total_hours,
            "total_amount": total_amount,
            "is_active": False
        }}
    )
    
    # Update spot status
    await db.spots.update_one(
        {"id": session["spot_id"]},
        {"$set": {"status": ParkingSpotStatus.AVAILABLE}}
    )
    
    return {
        "message": "Saída registrada com sucesso",
        "total_hours": total_hours,
        "total_amount": total_amount
    }

@api_router.get("/sessions", response_model=List[ParkingSession])
async def get_parking_sessions():
    """Listar todas as sessões"""
    sessions = await db.sessions.find().sort("created_at", -1).to_list(1000)
    return [ParkingSession(**session) for session in sessions]

@api_router.get("/sessions/active", response_model=List[ParkingSession])
async def get_active_sessions():
    """Listar sessões ativas"""
    sessions = await db.sessions.find({"is_active": True}).to_list(1000)
    return [ParkingSession(**session) for session in sessions]

# Transaction Management
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    """Registrar pagamento"""
    # Verify session exists
    session = await db.sessions.find_one({"id": transaction.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    transaction_dict = transaction.dict()
    transaction_dict["status"] = TransactionStatus.COMPLETED
    transaction_obj = Transaction(**transaction_dict)
    await db.transactions.insert_one(transaction_obj.dict())
    
    return transaction_obj

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions():
    """Listar todas as transações"""
    transactions = await db.transactions.find().sort("created_at", -1).to_list(1000)
    return [Transaction(**transaction) for transaction in transactions]

# Dashboard and Reports
@api_router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Obter estatísticas do dashboard"""
    # Count spots by status
    total_spots = await db.spots.count_documents({})
    occupied_spots = await db.spots.count_documents({"status": ParkingSpotStatus.OCCUPIED})
    available_spots = await db.spots.count_documents({"status": ParkingSpotStatus.AVAILABLE})
    maintenance_spots = await db.spots.count_documents({"status": ParkingSpotStatus.MAINTENANCE})
    
    # Count active sessions
    active_sessions = await db.sessions.count_documents({"is_active": True})
    
    # Calculate revenue
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    daily_transactions = await db.transactions.find({
        "created_at": {"$gte": today, "$lt": tomorrow},
        "status": TransactionStatus.COMPLETED
    }).to_list(1000)
    daily_revenue = sum(t["amount"] for t in daily_transactions)
    
    # Monthly revenue
    first_day_month = today.replace(day=1)
    monthly_transactions = await db.transactions.find({
        "created_at": {"$gte": first_day_month},
        "status": TransactionStatus.COMPLETED
    }).to_list(1000)
    monthly_revenue = sum(t["amount"] for t in monthly_transactions)
    
    return DashboardStats(
        total_spots=total_spots,
        occupied_spots=occupied_spots,
        available_spots=available_spots,
        maintenance_spots=maintenance_spots,
        active_sessions=active_sessions,
        daily_revenue=daily_revenue,
        monthly_revenue=monthly_revenue
    )

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Sistema de Estacionamento AGC-24h API"}

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()