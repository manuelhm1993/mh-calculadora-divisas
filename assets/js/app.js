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

    if(caller == 'resetear') resultado.textContent = '';

    calculadora['bcv'].focus();
};

const calculos = (values) => {
    //Realizar los cálculos
    const bs_bcv = values['Monto $'] * values['BCV'];
    const bs_paralelo = values['Monto $'] * values['Paralelo'];
    const diff_bs = bs_paralelo - bs_bcv;
    const diff_usd = (values['Paralelo'] > 0) ? diff_bs / values['Paralelo'] : 0;

    const results = {
        'Total BCV': bs_bcv,
        'Total Paralelo': bs_paralelo,
        'Diferencia en Bs': diff_bs,
        'Diferencia en $': diff_usd,
        'Total en $': values['Monto $'] - diff_usd
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

const getDataReports = (values) => {
    const results = calculos(values);
    const data = [
        Object.entries(values),
        Object.entries(results)
    ];

    return data;
};

const addItemsToCloneTable = (values, locale, options, cloneReporteTabla) => {
    const data = getDataReports(values);
    let cont = 0;

    data.forEach(element => {
        element.forEach(item => {
            if(cont == 0 || cont == 6 || cont == 7) {
                cloneReporteTabla.cells[cont].textContent = transformToMoney(item[1], locale, options);
            }
            else {
                cloneReporteTabla.cells[cont].textContent = transformToMoney(item[1]);
            }
            cont++;
        });
    });

    return cloneReporteTabla;
};

const addItemsToCloneList = (values, locale, options) => {
    const data = getDataReports(values);
    const fragmentResultadoSm = document.createDocumentFragment();
    let cont = 0;

    data.forEach(element => {
        element.forEach(item => {
            if(cont == 0 || cont == 6 || cont == 7) {
                fragmentResultadoSm.appendChild(createItemToListResultSm(item[0], transformToMoney(item[1], locale, options)));
            }
            else {
                fragmentResultadoSm.appendChild(createItemToListResultSm(item[0], transformToMoney(item[1])));
            }
            cont++;
        });
    });

    return fragmentResultadoSm;
};

const printResultForRML = (values, locale, options) => {
    const cloneResultadoMdLg = resultadoTemplateMdLg.cloneNode(true);
    let cloneReporteTabla = reporteTablaTemplate.firstElementChild.cloneNode(true);
    
    resultado.textContent = '';

    cloneReporteTabla = addItemsToCloneTable(values, locale, options, cloneReporteTabla);

    cloneResultadoMdLg.querySelector('table tbody').appendChild(cloneReporteTabla);

    resultado.appendChild(cloneResultadoMdLg);
};

const printResultForRSM = (values, locale, options) => {
    const cloneResultadoSm = resultadoTemplateSm.cloneNode(true);
    const fragmentResultadoSm = addItemsToCloneList(values, locale, options);

    resultado.textContent = '';

    cloneResultadoSm.querySelector('.list-group').appendChild(fragmentResultadoSm);

    resultado.appendChild(cloneResultadoSm);
};

const cargarTasa = (data) => {
    const key = (data.fuente == 'oficial') ? 'bcv' : data.fuente;

    calculadora[key].value = parseFloat(data.promedio).toFixed(2);
};

const procesoFetch = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    cargarTasa(data);
};

const fetchTasa = async (url) => {
    try 
    {
        if(typeof url === 'string') 
        {
            procesoFetch(url);
        }
        else {
            Object.values(url).forEach(element => {
                procesoFetch(element);
            });
        }
    } 
    catch (error) 
    {
        console.log(error);
    }
};

window.addEventListener('load', (e) => {
    const urlTasas = {
        bcv: 'https://ve.dolarapi.com/v1/dolares/oficial',
        paralelo: 'https://ve.dolarapi.com/v1/dolares/paralelo'
    };

    fetchTasa(urlTasas);
});

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
            'Monto $': calculadora['monto'].value,
            'BCV': calculadora['bcv'].value,
            'Paralelo': calculadora['paralelo'].value,
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