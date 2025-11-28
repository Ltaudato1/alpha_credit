# Income Prediction Service

Сервис для предсказания доходов клиентов на основе машинного обучения.

## Требования

- Python 3.10+
- pip

## Установка

### 1. Создание виртуальной среды

```bash
# Перейти в директорию проекта
cd /home/alexander/proga/alpha_credit

# Создать виртуальную среду
python -m venv venv

# Активировать виртуальную среду
# На Linux/Mac:
source venv/bin/activate
# На Windows:
# venv\Scripts\activate
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

## Запуск сервиса

```bash
# Убедитесь, что виртуальная среда активирована
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Сервис будет доступен по адресу: `http://localhost:8000`

Swagger UI документация: `http://localhost:8000/docs`

ReDoc документация: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- `GET /` - Статус сервиса
- `GET /health` - Health check

### Prediction
- `POST /predict` - Предсказать доход для одного клиента
- `POST /predict/batch` - Пакетное предсказание для нескольких клиентов

### Information
- `GET /features` - Получить список признаков модели
- `GET /model/info` - Получить информацию о модели

## Структура проекта

```
alpha_credit/
├── app/
│   ├── __init__.py
│   └── main.py           # Основной файл приложения
├── venv/                 # Виртуальная среда
├── requirements.txt      # Зависимости
└── README.md             # Этот файл
```

## Примеры использования

### Предсказание для одного клиента

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "education_years": 16,
    "work_experience": 10,
    "employment_type": "full-time",
    "marital_status": "married"
  }'
```

### Пакетное предсказание

```bash
curl -X POST "http://localhost:8000/predict/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "clients": [
      {
        "age": 35,
        "education_years": 16,
        "work_experience": 10,
        "employment_type": "full-time",
        "marital_status": "married"
      },
      {
        "age": 28,
        "education_years": 12,
        "work_experience": 5,
        "employment_type": "part-time",
        "marital_status": "single"
      }
    ]
  }'
```

## Разработка

Для добавления функционала ML модели отредактируйте функции в `app/main.py` (место, отмеченное как `# TODO`).

## Лицензия

MIT
