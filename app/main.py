from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.dataclasses import ClientData, PredictionResponse, BatchPredictionRequest, BatchPredictionResponse

from app.predictor import predictor

app = FastAPI(
    title="Income Prediction Service",
    description="Сервис для предсказания доходов на основе данных клиента",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Endpoints
@app.get("/", tags=["Health"])
def read_root():
    """Проверка статуса сервиса"""
    return {
        "message": "Income Prediction Service is running",
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_income(client_data: ClientData):
    """
    Предсказать доход клиента по его данным
    
    - **age**: Возраст клиента
    - **education_years**: Количество лет образования
    - **work_experience**: Опыт работы в годах
    - **employment_type**: Тип занятости (full-time, part-time, self-employed)
    - **marital_status**: Семейное положение (single, married, divorced)
    
    Возвращает предсказанный доход и уровень уверенности.
    """
    try:
        return predictor.predict_income(client_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
def predict_batch(request: BatchPredictionRequest):
    """
    Пакетное предсказание доходов для нескольких клиентов
    
    Принимает список клиентов и возвращает предсказания для каждого.
    """
    try:
        return predictor.predict_batch(request.clients)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/features", tags=["Info"])
def get_features():
    """Получить список признаков модели"""
    return {
        "features": [
            "age",
            "education_years",
            "work_experience",
            "employment_type",
            "marital_status"
        ],
        "version": "0.1.0"
    }


@app.get("/model/info", tags=["Info"])
def get_model_info():
    """Получить информацию о модели"""
    return {
        "model_name": "Income Prediction Model",
        "version": "0.1.0",
        "status": "development",
        "accuracy": "TBD"
    }
