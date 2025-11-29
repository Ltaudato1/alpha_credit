// API Base URL
const API_URL = 'http://localhost:8000';

// Глобальные переменные для хранения данных
let currentCsvData = null;
let currentBatchCsvData = null;

// Получаем элементы DOM с защитой от null
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`❌ Элемент с ID "${id}" не найден в DOM`);
    }
    return element;
}

// Основная инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing application...');
    
    // Инициализация вкладок
    initTabs();
    
    // Инициализация обработчиков файлов
    initFileHandlers();
    
    // Инициализация форм
    initForms();
    
    console.log('Application initialized successfully');
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log(`Found ${tabButtons.length} tab buttons`);
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            console.log(`Switching to tab: ${tabName}`);
            
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabContent = document.getElementById(tabName);
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            // Load info on demand
            if (tabName === 'info') {
                loadInfoTab();
            }
        });
    });
}

function initFileHandlers() {
    // Single prediction file input
    const csvFileInput = getElement('csvFile');
    if (csvFileInput) {
        csvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Single prediction CSV selected:', file.name);
                parseCsvFile(file, 'single');
            }
        });
    }
    
    // Batch prediction file input
    const batchCsvFileInput = getElement('batchCsvFile');
    if (batchCsvFileInput) {
        batchCsvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Batch prediction CSV selected:', file.name);
                parseCsvFile(file, 'batch');
            }
        });
    }
}

function initForms() {
    // Single prediction form
    const singleForm = getElement('singleForm');
    if (singleForm) {
        singleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Single prediction form submitted');
            await handleSinglePrediction();
        });
    }
    
    // Batch prediction button
    const batchBtn = getElement('batchBtn');
    if (batchBtn) {
        batchBtn.addEventListener('click', async () => {
            console.log('Batch prediction button clicked');
            await handleBatchPrediction();
        });
    }
}

// Функция для денормализации данных (преобразование обратно в исходный формат)
function denormalizeData(normalizedData) {
    const denormalized = {...normalizedData};
    
    // Преобразуем целочисленные поля
    const integerFields = [
        'age', 'hdb_bki_total_products', 'hdb_bki_total_pil_cnt', 
        'hdb_bki_total_ip_cnt', 'hdb_bki_active_pil_cnt', 
        'dp_ils_uniq_companies_1y', 'dp_ils_days_from_last_doc', 
        'dp_ils_cnt_changes_1y', 'blacklist_flag', 'nonresident_flag', 
        'client_active_flag', 'accountsalary_out_flag'
    ];
    
    const stringFields = ['gender', 'dp_ewb_last_employment_position'];
    
    // Преобразуем целые числа - округляем до целого
    integerFields.forEach(field => {
        if (field in denormalized) {
            denormalized[field] = Math.round(denormalized[field]);
        }
    });
    
    // Преобразуем строковые поля - маппим числовые значения обратно в строки
    if ('gender' in denormalized) {
        // Пример маппинга: -1.044 → "M", 0.956 → "F" и т.д.
        // Вам нужно знать реальное преобразование, использованное при нормализации
        denormalized.gender = denormalized.gender > 0 ? "F" : "M";
    }
    
    if ('dp_ewb_last_employment_position' in denormalized) {
        // Здесь нужно знать реальное преобразование позиций
        // Временно используем заглушку
        denormalized.dp_ewb_last_employment_position = "manager";
    }
    
    return denormalized;
}

// Функция для создания тестовых данных из CSV (альтернатива)
function createTestDataFromCSV(csvData, index) {
    if (!csvData || !csvData[index]) {
        console.warn('No CSV data available, using default test data');
        return createDefaultTestData();
    }
    
    const clientData = csvData[index];
    console.log('Raw CSV data for client', index, ':', clientData);
    
    // Преобразуем данные из CSV
    return convertToStructuredData(clientData);
}

// Функция для создания данных по умолчанию
function createDefaultTestData() {
    return {
        personal: {
            age: 35,
            gender: "M"
        },
        financial: {
            turn_cur_cr_avg_act_v2: 1000,
            diff_avg_cr_db_turn: 50,
            curr_rur_amt_cm_avg: 2000,
            dda_rur_amt_curr_v2: 1500,
            loanacc_rur_amt_cm_avg: 3000,
            express_rur_amt_cm_avg: 1000,
            total_rur_amt_cm_avg: 8000,
            profit_income_out_rur_amt_12m: 50000,
            profit_income_out_rur_amt_l2m: 40000
        },
        credit: {
            hdb_bki_total_max_limit: 100000,
            hdb_bki_total_pil_max_limit: 80000,
            hdb_outstand_sum: 50000,
            hdb_ovrd_sum: 1000,
            hdb_bki_total_products: 5,
            hdb_bki_total_pil_cnt: 3,
            hdb_bki_total_ip_cnt: 2,
            hdb_bki_total_max_overdue_sum: 500,
            hdb_bki_total_pil_max_overdue: 200,
            hdb_bki_total_pil_max_del90: 100,
            hdb_bki_active_cc_max_limit: 50000,
            hdb_bki_active_pil_cnt: 2
        },
        spending: {
            avg_by_category__amount__sum__cashflowcategory_name__supermarkety: 2000,
            avg_6m_restaurants: 1000,
            avg_6m_travel: 500,
            transaction_category_supermarket_percent_cnt_2m: 0.3,
            by_category__amount__sum__eoperation_type_name__perevod_po_nomeru_telefona: 500
        },
        employment: {
            dp_ils_avg_salary_1y: 50000,
            dp_ils_paymentssum_avg_12m: 48000,
            dp_ewb_last_employment_position: "manager",
            dp_ils_total_seniority: 5,
            dp_ils_uniq_companies_1y: 2,
            dp_ils_days_from_last_doc: 30,
            dp_ils_cnt_changes_1y: 1
        },
        additional: {
            per_capita_income_rur_amt: 40000,
            label_Above_1M_share_r1: 0.1,
            salary_median_in_gex_r1: 45000,
            blacklist_flag: 0,
            nonresident_flag: 0,
            client_active_flag: 1,
            accountsalary_out_flag: 1,
            first_salary_income: 52000
        }
    };
}

async function handleSinglePrediction() {
    // Проверяем загруженные данные
    if (!currentCsvData) {
        alert('Сначала загрузите CSV файл');
        return;
    }
    
    const clientIndexInput = document.getElementById('clientIndex');
    if (!clientIndexInput) {
        alert('Ошибка: поле индекса клиента не найдено');
        return;
    }
    
    const clientIndex = parseInt(clientIndexInput.value);
    
    if (isNaN(clientIndex)) {
        alert('Введите корректный номер индекса');
        return;
    }
    
    if (clientIndex < 0 || clientIndex >= currentCsvData.length) {
        alert(`Неверный индекс клиента. Допустимый диапазон: 0-${currentCsvData.length - 1}`);
        return;
    }
    
    try {
        // Используем данные из CSV с преобразованием
        const structuredData = createTestDataFromCSV(currentCsvData, clientIndex);
        
        console.log('📤 Sending data to server (from CSV):', JSON.stringify(structuredData, null, 2));
        
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(structuredData)
        });

        if (!response.ok) {
            let errorDetail = '';
            try {
                const errorData = await response.json();
                errorDetail = JSON.stringify(errorData, null, 2);
            } catch (e) {
                errorDetail = await response.text();
            }
            
            console.error('❌ Server error details:', errorDetail);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetail}`);
        }

        const data = await response.json();
        console.log('✅ Server response:', data);
        
        displaySingleResult(data, clientIndex, currentCsvData[clientIndex]);
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при предсказании: ' + error.message);
    }
}

async function handleBatchPrediction() {
    if (!currentBatchCsvData) {
        alert('Сначала загрузите CSV файл');
        return;
    }

    try {
        const clients = currentBatchCsvData.map(clientData => convertToStructuredData(clientData));
        console.log(`Processing batch of ${clients.length} clients`);
        
        const response = await fetch(`${API_URL}/predict/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clients })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayBatchResult(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при пакетном предсказании: ' + error.message);
    }
}

function parseCsvFile(file, type) {
    console.log(`Parsing CSV file: ${file.name}`);
    
    if (typeof Papa === 'undefined') {
        alert('Ошибка: Библиотека Papa Parse не загружена. Проверьте подключение к интернету.');
        return;
    }
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        delimiter: ',', // явно указываем разделитель
        skipEmptyLines: true,
        complete: function(results) {
            console.log('CSV parse results:', results);
            
            if (results.errors.length > 0) {
                console.error('CSV parse errors:', results.errors);
                alert('Ошибка при чтении CSV файла: ' + results.errors[0].message);
                return;
            }
            
            if (results.data.length === 0) {
                alert('Файл не содержит данных');
                return;
            }
            
            // Проверяем структуру данных
            const firstRow = results.data[0];
            const columnCount = Object.keys(firstRow).length;
            console.log(`Первая строка данных:`, firstRow);
            console.log(`Количество колонок: ${columnCount}`);
            console.log(`Названия колонок:`, Object.keys(firstRow));
            
            if (columnCount === 1) {
                alert(`⚠️ Внимание: найдена только 1 колонка вместо ожидаемых 49+. Возможные проблемы:\n\n1. Неправильный разделитель (используется точка с запятой или табуляция вместо запятой)\n2. Файл не в формате CSV\n3. Все данные в одной колонке\n\nПроверьте формат файла и попробуйте снова.`);
                return;
            }
            
            if (type === 'single') {
                currentCsvData = results.data;
                alert(`✅ Успешно загружено ${currentCsvData.length} клиентов, ${columnCount} признаков`);
                console.log('Загруженные данные:', currentCsvData);
            } else {
                currentBatchCsvData = results.data;
                alert(`✅ Успешно загружено ${currentBatchCsvData.length} клиентов для пакетной обработки, ${columnCount} признаков`);
            }
        },
        error: function(error) {
            console.error('CSV parse error:', error);
            alert('Ошибка при загрузке файла: ' + error.message);
        }
    });
}

function convertToStructuredData(flatData) {
    if (!flatData || typeof flatData !== 'object') {
        console.warn('Invalid flatData:', flatData);
        flatData = {};
    }
    
    return {
        personal: {
            age: flatData.age || 0,
            gender: flatData.gender || 'unknown'
        },
        financial: {
            turn_cur_cr_avg_act_v2: flatData.turn_cur_cr_avg_act_v2 || 0,
            diff_avg_cr_db_turn: flatData.diff_avg_cr_db_turn || 0,
            curr_rur_amt_cm_avg: flatData.curr_rur_amt_cm_avg || 0,
            dda_rur_amt_curr_v2: flatData.dda_rur_amt_curr_v2 || 0,
            loanacc_rur_amt_cm_avg: flatData.loanacc_rur_amt_cm_avg || 0,
            express_rur_amt_cm_avg: flatData.express_rur_amt_cm_avg || 0,
            total_rur_amt_cm_avg: flatData.total_rur_amt_cm_avg || 0,
            profit_income_out_rur_amt_12m: flatData.profit_income_out_rur_amt_12m || 0,
            profit_income_out_rur_amt_l2m: flatData.profit_income_out_rur_amt_l2m || 0
        },
        credit: {
            hdb_bki_total_max_limit: flatData.hdb_bki_total_max_limit || 0,
            hdb_bki_total_pil_max_limit: flatData.hdb_bki_total_pil_max_limit || 0,
            hdb_outstand_sum: flatData.hdb_outstand_sum || 0,
            hdb_ovrd_sum: flatData.hdb_ovrd_sum || 0,
            hdb_bki_total_products: flatData.hdb_bki_total_products || 0,
            hdb_bki_total_pil_cnt: flatData.hdb_bki_total_pil_cnt || 0,
            hdb_bki_total_ip_cnt: flatData.hdb_bki_total_ip_cnt || 0,
            hdb_bki_total_max_overdue_sum: flatData.hdb_bki_total_max_overdue_sum || 0,
            hdb_bki_total_pil_max_overdue: flatData.hdb_bki_total_pil_max_overdue || 0,
            hdb_bki_total_pil_max_del90: flatData.hdb_bki_total_pil_max_del90 || 0,
            hdb_bki_active_cc_max_limit: flatData.hdb_bki_active_cc_max_limit || 0,
            hdb_bki_active_pil_cnt: flatData.hdb_bki_active_pil_cnt || 0
        },
        spending: {
            avg_by_category__amount__sum__cashflowcategory_name__supermarkety: flatData.avg_by_category__amount__sum__cashflowcategory_name__supermarkety || 0,
            avg_6m_restaurants: flatData.avg_6m_restaurants || 0,
            avg_6m_travel: flatData.avg_6m_travel || 0,
            transaction_category_supermarket_percent_cnt_2m: flatData.transaction_category_supermarket_percent_cnt_2m || 0,
            by_category__amount__sum__eoperation_type_name__perevod_po_nomeru_telefona: flatData.by_category__amount__sum__eoperation_type_name__perevod_po_nomeru_telefona || 0
        },
        employment: {
            dp_ils_avg_salary_1y: flatData.dp_ils_avg_salary_1y || 0,
            dp_ils_paymentssum_avg_12m: flatData.dp_ils_paymentssum_avg_12m || 0,
            dp_ewb_last_employment_position: flatData.dp_ewb_last_employment_position || 'unknown',
            dp_ils_total_seniority: flatData.dp_ils_total_seniority || 0,
            dp_ils_uniq_companies_1y: flatData.dp_ils_uniq_companies_1y || 0,
            dp_ils_days_from_last_doc: flatData.dp_ils_days_from_last_doc || 0,
            dp_ils_cnt_changes_1y: flatData.dp_ils_cnt_changes_1y || 0
        },
        additional: {
            per_capita_income_rur_amt: flatData.per_capita_income_rur_amt || 0,
            label_Above_1M_share_r1: flatData.label_Above_1M_share_r1 || 0,
            salary_median_in_gex_r1: flatData.salary_median_in_gex_r1 || 0,
            blacklist_flag: flatData.blacklist_flag || 0,
            nonresident_flag: flatData.nonresident_flag || 0,
            client_active_flag: flatData.client_active_flag || 0,
            accountsalary_out_flag: flatData.accountsalary_out_flag || 0,
            first_salary_income: flatData.first_salary_income || 0
        }
    };
}

function displaySingleResult(data, clientIndex, clientData) {
    const incomeValue = getElement('incomeValue');
    const singleResult = getElement('singleResult');
    
    if (incomeValue) incomeValue.textContent = `₽${data.predicted_income.toFixed(2)}`;
    if (singleResult) singleResult.classList.remove('hidden');
    
    console.log('Single prediction result displayed');
}

function displayBatchResult(data) {
    const resultList = getElement('batchResultList');
    const totalClients = getElement('totalClients');
    const batchResult = getElement('batchResult');
    
    if (resultList) {
        resultList.innerHTML = '';
        
        data.predictions.forEach((prediction, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <p><strong>Клиент #${index}</strong></p>
                <p>Доход: <strong>$${prediction.predicted_income.toFixed(2)}</strong></p>
            `;
            resultList.appendChild(item);
        });
    }
    
    if (totalClients) totalClients.textContent = data.total_count;
    if (batchResult) batchResult.classList.remove('hidden');
    
    console.log('Batch prediction results displayed');
}

async function loadInfoTab() {
    console.log('Loading info tab...');
    
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        const apiStatus = getElement('apiStatus');
        if (apiStatus) {
            apiStatus.innerHTML = `
                <p class="status-ok">✅ API работает нормально</p>
                <p>Статус: ${data.status}</p>
            `;
        }
    } catch (error) {
        const apiStatus = getElement('apiStatus');
        if (apiStatus) {
            apiStatus.innerHTML = `
                <p class="status-error">❌ API недоступен</p>
                <p>${error.message}</p>
            `;
        }
    }

    try {
        const response = await fetch(`${API_URL}/model/info`);
        const data = await response.json();
        const modelInfo = getElement('modelInfo');
        if (modelInfo) {
            modelInfo.innerHTML = `
                <p><strong>Название:</strong> ${data.model_name}</p>
                <p><strong>Версия:</strong> ${data.version}</p>
                <p><strong>Статус:</strong> ${data.status}</p>
                <p><strong>Точность:</strong> ${data.accuracy}</p>
            `;
        }
    } catch (error) {
        const modelInfo = getElement('modelInfo');
        if (modelInfo) {
            modelInfo.innerHTML = `<p class="status-error">Ошибка загрузки: ${error.message}</p>`;
        }
    }

    try {
        const response = await fetch(`${API_URL}/features`);
        const data = await response.json();
        const features = getElement('features');
        if (features) {
            const featuresList = data.features.map(f => `<li>${f}</li>`).join('');
            features.innerHTML = `
                <p>Всего признаков: ${data.total_features || data.features.length}</p>
                <ul>${featuresList}</ul>
            `;
        }
    } catch (error) {
        const features = getElement('features');
        if (features) {
            features.innerHTML = `<p class="status-error">Ошибка загрузки: ${error.message}</p>`;
        }
    }
}

console.log('Income Prediction Service UI script loaded');