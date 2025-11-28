from pydantic import BaseModel
from typing import List


class ClientData(BaseModel):
    """Данные клиента для предсказания доходов"""
    age: int
    education_years: int
    work_experience: int
    employment_type: str
    marital_status: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "age": 35,
                "education_years": 16,
                "work_experience": 10,
                "employment_type": "full-time",
                "marital_status": "married"
            }
        }


class PredictionResponse(BaseModel):
    """Ответ с предсказанием дохода"""
    predicted_income: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "predicted_income": 75000.50,
            }
        }


class BatchPredictionRequest(BaseModel):
    """Запрос для пакетного предсказания"""
    clients: List[ClientData]


class BatchPredictionResponse(BaseModel):
    """Ответ с пакетным предсказанием"""
    predictions: List[PredictionResponse]
    total_count: int


