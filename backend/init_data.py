"""
Script para inicializar dados do sistema de estacionamento
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def init_parking_spots():
    """Inicializar vagas de estacionamento"""
    
    # Check if spots already exist
    count = await db.spots.count_documents({})
    if count > 0:
        print(f"Já existem {count} vagas cadastradas")
        return
    
    # Create default parking spots
    spots = []
    
    # Regular spots (A1-A20)
    for i in range(1, 21):
        spots.append({
            "id": f"spot-a{i:02d}",
            "number": f"A{i:02d}",
            "status": "available",
            "spot_type": "regular",
            "hourly_rate": 5.0
        })
    
    # Premium spots (P1-P10)
    for i in range(1, 11):
        spots.append({
            "id": f"spot-p{i:02d}",
            "number": f"P{i:02d}",
            "status": "available",
            "spot_type": "premium",
            "hourly_rate": 8.0
        })
    
    # Disabled spots (D1-D5)
    for i in range(1, 6):
        spots.append({
            "id": f"spot-d{i:02d}",
            "number": f"D{i:02d}",
            "status": "available",
            "spot_type": "disabled",
            "hourly_rate": 3.0
        })
    
    # Insert spots
    await db.spots.insert_many(spots)
    print(f"Criadas {len(spots)} vagas de estacionamento")

async def main():
    await init_parking_spots()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())