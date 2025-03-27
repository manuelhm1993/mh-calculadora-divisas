const calculadora = document.querySelector('#calculadora');
const resultado = document.querySelector('#resultado');
const resultadoSM = document.querySelector('#resultado-sm');

//Resolución +800
const table = document.querySelector('#resultado table');
const tr = document.querySelector('#resultado table tbody tr');

//Resolución -800
const grupo = document.querySelector('#resultado-sm .list-group');

const transformToMoney = (number, locale = "es-ve", options = { style: "currency", currency: "VES", maximumFractionDigits: 2 }) => {
    return new Intl.NumberFormat(locale, options).format(number);
};

const calculos = (values) => {
    //Realizar los cálculos
    const bs_bcv = values.monto * values.bcv;
    const bs_paralelo = values.monto * values.paralelo;
    const diff_bs = bs_paralelo - bs_bcv;

    const results = {
        'bs_bcv': bs_bcv,
        'bs_paralelo': bs_paralelo,
        'diff_bs': diff_bs,
        'diff_usd': (values.paralelo > 0) ? diff_bs / values.paralelo : 0,
    };

    return results;
};

const printResultForRML = (values, locale, options) => {
    const results = calculos(values);

    grupo.innerHTML = '';

    tr.innerHTML = '';
    tr.innerHTML = `
        <td>${transformToMoney(values.monto, locale, options)}</td>
        <td>${transformToMoney(values.bcv)}</td>
        <td>${transformToMoney(values.paralelo)}</td>
        <td>${transformToMoney(results.bs_bcv)}</td>
        <td>${transformToMoney(results.bs_paralelo)}</td>
        <td>${transformToMoney(results.diff_bs)}</td>
        <td>${transformToMoney(results.diff_usd, locale, options)}</td>
        <td>${transformToMoney((values.monto - results.diff_usd), locale, options)}</td>
    `;
};

const printResultForRSM = (values, locale, options) => {
    const results = calculos(values);

    table.innerHTML = '';

    grupo.innerHTML = '';
    grupo.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Monto $</p>
            <small class="fs-6">${transformToMoney(values.monto, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">BCV</p>
            <small class="fs-6">${transformToMoney(values.bcv, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Paralelo</p>
            <small class="fs-6">${transformToMoney(values.paralelo, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Total BCV</p>
            <small class="fs-6">${transformToMoney(results.bs_bcv, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Total Paralelo</p>
            <small class="fs-6">${transformToMoney(results.bs_paralelo, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Diferencia en Bs</p>
            <small class="fs-6">${transformToMoney(results.diff_bs, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Diferencia en $</p>
            <small class="fs-6">${transformToMoney(results.diff_usd, locale, options)}</small>
        </div>

        <div class="d-flex w-100 justify-content-between">
            <p class="mb-1 fw-bold text-uppercase fs-6">Total pagado en $</p>
            <small class="fs-6">${transformToMoney((values.monto - results.diff_usd), locale, options)}</small>
        </div>
    `;
};

const reset = (screenWidth, caller = 'resetear') => {
    calculadora['bcv'].value = '';
    calculadora['paralelo'].value = '';
    calculadora['monto'].value = '';

    if(caller == 'resetear') {
        resultado.classList.add('d-none');
        resultadoSM.classList.add('d-none');
    }
    else {
        if(screenWidth >= 800) {
            resultado.classList.remove('d-none');
        }
        else {
            resultadoSM.classList.remove('d-none');
        }
    }

    calculadora['bcv'].focus();
};

document.addEventListener('reset', (e) => {
    e.preventDefault();

    if(e.target.id == calculadora.id) {
        reset();
    }
});

document.addEventListener('submit', (e) => {
    e.preventDefault();

    if(e.target.id == calculadora.id) {
        //Capturar el valor de los campos
        const values = {
            'bcv': calculadora['bcv'].value,
            'paralelo': calculadora['paralelo'].value,
            'monto': calculadora['monto'].value,
        };

        //Definir el formato moneda
        const locale = 'en-US';
        const options = { style: "currency", currency: "USD", maximumFractionDigits: 2 };
        const screenWidth = window.innerWidth;

        //Imprimir el reporte
        if(screenWidth >= 800) {
            printResultForRML(values, locale, options);
        }
        else {
            printResultForRSM(values, locale, options);
        }

        reset(screenWidth, calculadora.id);
    }
});

//TODO: solventar el bug al redimensionar
/*window.addEventListener("resize", (e) => {
    location.reload();
});*/