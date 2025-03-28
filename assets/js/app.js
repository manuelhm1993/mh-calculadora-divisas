const calculadora = document.querySelector('#calculadora');
const resultado = document.querySelector('#resultado');

//Templates
//Resolución +800
const resultadoTemplateMdLg = document.querySelector('#resultado-template-md-lg').content;
const reporteTablaTemplate = document.querySelector('#reporte-tabla-template').content;

//Resolución -800
const resultadoTemplateSm = document.querySelector('#resultado-template-sm').content;
const reporteListaTemplate = document.querySelector('#reporte-lista-template').content;

const reset = (caller = 'resetear') => {
    calculadora['bcv'].value = '';
    calculadora['paralelo'].value = '';
    calculadora['monto'].value = '';

    if(caller == 'resetear') resultado.innerHTML = '';

    calculadora['bcv'].focus();
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

const transformToMoney = (number, locale = "es-ve", options = { style: "currency", currency: "VES", maximumFractionDigits: 2 }) => {
    return new Intl.NumberFormat(locale, options).format(number);
};

const createItemToListResultSm = (razon, monto) => {
    const cloneReporteLista = reporteListaTemplate.firstElementChild.cloneNode(true);

    cloneReporteLista.querySelector('.d-flex p').textContent = razon;
    cloneReporteLista.querySelector('.d-flex small').textContent = monto;

    return cloneReporteLista;
};

const printResultForRML = (values, locale, options) => {
    const results = calculos(values);

    resultado.innerHTML = '';

    const cloneResultadoMdLg = resultadoTemplateMdLg.cloneNode(true);
    const cloneReporteTabla = reporteTablaTemplate.firstElementChild.cloneNode(true);

    cloneReporteTabla.cells[0].textContent = transformToMoney(values.monto, locale, options);
    cloneReporteTabla.cells[1].textContent = transformToMoney(values.bcv);
    cloneReporteTabla.cells[2].textContent = transformToMoney(values.paralelo);
    cloneReporteTabla.cells[3].textContent = transformToMoney(results.bs_bcv);
    cloneReporteTabla.cells[4].textContent = transformToMoney(results.bs_paralelo);
    cloneReporteTabla.cells[5].textContent = transformToMoney(results.diff_bs);
    cloneReporteTabla.cells[6].textContent = transformToMoney(results.diff_usd, locale, options);
    cloneReporteTabla.cells[7].textContent = transformToMoney((values.monto - results.diff_usd), locale, options);

    cloneResultadoMdLg.querySelector('table tbody').appendChild(cloneReporteTabla);

    resultado.appendChild(cloneResultadoMdLg);
};

const printResultForRSM = (values, locale, options) => {
    const results = calculos(values);

    resultado.innerHTML = '';

    const fragmentResultadoSm = document.createDocumentFragment();

    fragmentResultadoSm.appendChild(createItemToListResultSm("Monto $", transformToMoney(values.monto, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("BCV", transformToMoney(values.bcv, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("Paralelo", transformToMoney(values.paralelo, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("Total BCV", transformToMoney(results.bs_bcv, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("Total Paralelo", transformToMoney(results.bs_paralelo, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("Diferencia en Bs", transformToMoney(results.diff_bs, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("Diferencia en $", transformToMoney(results.diff_usd, locale, options)));
    fragmentResultadoSm.appendChild(createItemToListResultSm("Total en $", transformToMoney((values.monto - results.diff_usd), locale, options)));

    const cloneResultadoSm = resultadoTemplateSm.cloneNode(true);

    cloneResultadoSm.querySelector('.list-group').appendChild(fragmentResultadoSm);

    resultado.appendChild(cloneResultadoSm);
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

        reset(e.target.id);
    }
});