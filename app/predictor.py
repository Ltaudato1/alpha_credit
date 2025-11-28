from app.dataclasses import BatchPredictionResponse, ClientData, PredictionResponse
import pandas as pd
from typing import List


class Predictor:
    """Класс для предсказания доходов клиентов"""

    def __init__(self, model=None):
        """
        Инициализация класса Predictor.
        
        :param model: ML модель для предсказания доходов (по умолчанию None)
        """
        self.model = model
    
    def predict_income(self, client_data: ClientData) -> PredictionResponse:
        """Метод для предсказания дохода одного клиента"""
        try:
            data_dict = client_data.dict()
            df = pd.DataFrame([data_dict])

            prediction = self.model.predict(df) if self.model else 52
            predicted_income = prediction[0] if isinstance(prediction, (list, pd.Series)) else prediction
            
            return PredictionResponse(predicted_income=predicted_income)
        except Exception as e:
            raise ValueError(f"Ошибка при предсказании дохода: {str(e)}")
    def predict_batch(self, clients: List[ClientData]) -> BatchPredictionResponse:
        """Метод для пакетного предсказания доходов"""
        try:
            data_dicts = [client.dict() for client in clients]
            df = pd.DataFrame(data_dicts)

            predictions = self.model.predict(df) if self.model else 52
            predicted_incomes = predictions if isinstance(predictions, (list, pd.Series)) else [predictions]

            response = BatchPredictionResponse(
                predictions=[PredictionResponse(predicted_income=income) for income in predicted_incomes],
                total_count=len(predicted_incomes)
            )
            return response
        except Exception as e:
            raise ValueError(f"Ошибка при пакетном предсказании доходов: {str(e)}")


predictor = Predictor()  # TODO: Добавить модель