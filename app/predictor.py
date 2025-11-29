import pickle
from app.dataclasses import BatchPredictionResponse, ClientData, PredictionResponse
import pandas as pd
from typing import List

def flatten_client_data(nested_dict: dict) -> dict:
    """Преобразует вложенный словарь клиентских данных в плоский словарь"""
    flat_dict = {}
    
    # Проходим по всем группам
    for group_name, group_data in nested_dict.items():
        if isinstance(group_data, dict):
            for feature_name, value in group_data.items():
                flat_dict[feature_name] = value
        else:
            flat_dict[group_name] = group_data
            
    return flat_dict

class Predictor:
    """Класс для предсказания доходов клиентов"""

    def __init__(self, model=None):
        self.model = model
        self.feature_order = ['turn_cur_cr_avg_act_v2',
        'diff_avg_cr_db_turn',
        'curr_rur_amt_cm_avg',
        'dda_rur_amt_curr_v2',
        'loanacc_rur_amt_cm_avg',
        'express_rur_amt_cm_avg',
        'total_rur_amt_cm_avg',
        'profit_income_out_rur_amt_12m',
        'profit_income_out_rur_amt_l2m',
        'hdb_bki_total_max_limit',
        'hdb_bki_total_pil_max_limit',
        'hdb_outstand_sum',
        'hdb_ovrd_sum',
        'hdb_bki_total_products',
        'hdb_bki_total_pil_cnt',
        'hdb_bki_total_ip_cnt',
        'hdb_bki_total_max_overdue_sum',
        'hdb_bki_total_pil_max_overdue',
        'hdb_bki_total_pil_max_del90',
        'hdb_bki_active_cc_max_limit',
        'hdb_bki_active_pil_cnt',
        'avg_by_category__amount__sum__cashflowcategory_name__supermarkety',
        'avg_6m_restaurants',
        'avg_6m_travel',
        'transaction_category_supermarket_percent_cnt_2m',
        'by_category__amount__sum__eoperation_type_name__perevod_po_nomeru_telefona',
        'dp_ils_avg_salary_1y',
        'dp_ils_paymentssum_avg_12m',
        'dp_ewb_last_employment_position', 
        'dp_ils_total_seniority',
        'dp_ils_uniq_companies_1y',
        'dp_ils_days_from_last_doc',
        'dp_ils_cnt_changes_1y',
        'age',
        'gender', 
        'per_capita_income_rur_amt',
        'label_Above_1M_share_r1',
        'salary_median_in_gex_r1',
        'blacklist_flag',
        'nonresident_flag',
        'client_active_flag',
        'accountsalary_out_flag',
        'first_salary_income'
    ]
    

    
    def predict_income(self, client_data: ClientData) -> PredictionResponse:
        """Метод для предсказания дохода одного клиента"""
        try:
            # Получаем вложенный словарь и преобразуем в плоский
            data_dict = client_data.model_dump()
            flat_data = flatten_client_data(data_dict)

            df = pd.DataFrame([flat_data])[self.feature_order]
            
            prediction = self.model.predict(df) if self.model else 52000
            predicted_income = prediction[0] if hasattr(prediction, '__iter__') else prediction
            
            return PredictionResponse(predicted_income=predicted_income)
        except Exception as e:
            raise ValueError(f"Ошибка при предсказании дохода: {str(e)}") 
    
    def predict_batch(self, clients: List[ClientData]) -> BatchPredictionResponse:
        """Метод для пакетного предсказания доходов"""
        try:
            # Преобразуем каждый клиентский объект в плоский словарь
            flat_data_list = []
            for client in clients:
                data_dict = client.dict()
                flat_data = flatten_client_data(data_dict)
                flat_data_list.append(flat_data)
            
            # Создаем DataFrame
            df = pd.DataFrame(flat_data_list)[self.feature_order]
            
            # Кодируем категориальные фичи
            df_encoded = self._encode_categorical_features(df)
            
            predictions = self.model.predict(df_encoded) if self.model else [52000] * len(clients)
            
            response = BatchPredictionResponse(
                predictions=[PredictionResponse(predicted_income=income) for income in predictions],
                total_count=len(predictions)
            )
            return response
        except Exception as e:
            raise ValueError(f"Ошибка при пакетном предсказании доходов: {str(e)}")
    
    def _encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Кодирует категориальные переменные"""
        df_encoded = df.copy()
        
        # Пример кодирования (замените на вашу логику)
        if 'gender' in df_encoded.columns:
            df_encoded['gender'] = df_encoded['gender'].map({'M': 0, 'F': 1})
        
        if 'dp_ewb_last_employment_position' in df_encoded.columns:
            # One-hot encoding или label encoding в зависимости от модели
            df_encoded = pd.get_dummies(df_encoded, columns=['dp_ewb_last_employment_position'], prefix='position')
        
        return df_encoded


predictor = None

with open('app/model.pkl', 'rb') as f:
    predictor = Predictor(pickle.load(f))

