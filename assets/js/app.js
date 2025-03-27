const calculadora = document.querySelector('#calculadora');
const resultado = document.querySelector('#resultado');

//Resolución +800
const table = document.querySelector('#resultado table');
const tr = document.querySelector('#resultado table tbody tr');

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
    table.innerHTML = '';
};

const reset = (caller = 'resetear') => {
    calculadora['bcv'].value = '';
    calculadora['paralelo'].value = '';
    calculadora['monto'].value = '';

    if(caller == 'resetear') {
        resultado.classList.add('d-none');
    }
    else {
        resultado.classList.remove('d-none');
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

        //Imprimir el reporte
        if(window.innerWidth >= 800) {
            printResultForRML(values, locale, options);
        }
        else {
            printResultForRSM();
        }

        reset(calculadora.id);
    }
});