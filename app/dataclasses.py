from pydantic import BaseModel
from typing import List


from pydantic import BaseModel
from typing import Union

class PersonalInfo(BaseModel):
    age: float  # было int
    gender: float

class FinancialFeatures(BaseModel):
    turn_cur_cr_avg_act_v2: float
    diff_avg_cr_db_turn: float
    curr_rur_amt_cm_avg: float
    dda_rur_amt_curr_v2: float
    loanacc_rur_amt_cm_avg: float
    express_rur_amt_cm_avg: float
    total_rur_amt_cm_avg: float
    profit_income_out_rur_amt_12m: float
    profit_income_out_rur_amt_l2m: float

class CreditHistory(BaseModel):
    hdb_bki_total_max_limit: float
    hdb_bki_total_pil_max_limit: float
    hdb_outstand_sum: float
    hdb_ovrd_sum: float
    hdb_bki_total_products: float  # было int
    hdb_bki_total_pil_cnt: float   # было int
    hdb_bki_total_ip_cnt: float    # было int
    hdb_bki_total_max_overdue_sum: float
    hdb_bki_total_pil_max_overdue: float
    hdb_bki_total_pil_max_del90: float
    hdb_bki_active_cc_max_limit: float
    hdb_bki_active_pil_cnt: float  # было int

class SpendingPatterns(BaseModel):
    avg_by_category__amount__sum__cashflowcategory_name__supermarkety: float
    avg_6m_restaurants: float
    avg_6m_travel: float
    transaction_category_supermarket_percent_cnt_2m: float
    by_category__amount__sum__eoperation_type_name__perevod_po_nomeru_telefona: float

class EmploymentInfo(BaseModel):
    dp_ils_avg_salary_1y: float
    dp_ils_paymentssum_avg_12m: float
    dp_ewb_last_employment_position: float
    dp_ils_total_seniority: float
    dp_ils_uniq_companies_1y: float  # было int
    dp_ils_days_from_last_doc: float # было int
    dp_ils_cnt_changes_1y: float     # было int

class AdditionalFeatures(BaseModel):
    per_capita_income_rur_amt: float
    label_Above_1M_share_r1: float
    salary_median_in_gex_r1: float
    blacklist_flag: float  # было int
    nonresident_flag: float  # было int
    client_active_flag: float  # было int
    accountsalary_out_flag: float  # было int
    first_salary_income: float

class ClientData(BaseModel):
    personal: PersonalInfo
    financial: FinancialFeatures
    credit: CreditHistory
    spending: SpendingPatterns
    employment: EmploymentInfo
    additional: AdditionalFeatures


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


