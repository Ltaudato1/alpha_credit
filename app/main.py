from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

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

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Root endpoint - serve index.html
@app.get("/", tags=["Frontend"])
def serve_index():
    """Serve the main HTML page"""
    templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
    index_path = os.path.join(templates_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return {"message": "Welcome to Income Prediction Service"}


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
    
    - **49 финансовых, кредитных и персональных признаков**
    - Включая информацию о занятости, кредитной истории и spending patterns
    
    Возвращает предсказанный доход.
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
        "features": features_list,
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

features_list = ['turn_cur_cr_avg_act_v2',
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