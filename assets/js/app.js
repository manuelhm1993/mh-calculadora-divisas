const calculadora = document.querySelector('#calculadora');
const resultado = document.querySelector('#resultado');

//Templates
//Resolución +800
const resultadoTemplateMdLg = document.querySelector('#resultado-template-md-lg').content;
const reporteTablaTemplate = document.querySelector('#reporte-tabla-template').content;

//Resolución -800
const resultadoTemplateSm = document.querySelector('#resultado-template-sm').content;
const reporteListaTemplate = document.querySelector('#reporte-lista-template').content;

//URL de la API dolarapi.com
const urlTasas = {
    bcv: 'https://ve.dolarapi.com/v1/dolares/oficial',
    paralelo: 'https://ve.dolarapi.com/v1/dolares/paralelo'
    //binance: 'https://ve.dolarapi.com/v1/dolares/bitcoin'
};

const reset = (caller = 'resetear') => {
    calculadora['bcv'].value = '';
    calculadora['paralelo'].value = '';
    calculadora['monto'].value = '';
    calculadora['base'][0].checked = true;

    if(caller == 'resetear') resultado.textContent = '';

    fetchTasa(urlTasas);
};

const calcularUSD = (values) => {
    //Realizar los cálculos
    const bs_bcv = values['Monto $'] * values['BCV'];
    const bs_paralelo = values['Monto $'] * values['Paralelo'];
    const diff_bs = bs_paralelo - bs_bcv;
    const diff_usd = (values['Paralelo'] > 0) ? diff_bs / values['Paralelo'] : 0;

    const results = {
        bs_bcv: bs_bcv,
        bs_paralelo: bs_paralelo,
        diff_bs: diff_bs,
        diff_usd: diff_usd
    };

    return results;
};

const calcularVES = (values) => {
    //Realizar los cálculos
    const bs_bcv = values['Monto $'] / values['BCV'];
    const bs_paralelo = values['Monto $'] / values['Paralelo'];
    const diff_bs = bs_bcv - bs_paralelo;
    const diff_usd = diff_bs * values['Paralelo']

    const results = {
        bs_bcv: bs_bcv,
        bs_paralelo: bs_paralelo,
        diff_bs: diff_bs,
        diff_usd: diff_usd
    };

    return results;
};

const calculos = (values, base) => {
    const data = (base === 'usd') ? calcularUSD(values) : calcularVES(values);
    
    let results = {};

    if(base === 'usd') 
    {
        results = {
            'Total BCV': data.bs_bcv,
            'Total Paralelo': data.bs_paralelo,
            'Diferencia en Bs': data.diff_bs,
            'Diferencia en $': data.diff_usd,
            'Total en $': values['Monto $'] - data.diff_usd
        };
    }
    else 
    {
        results = {
            'Total BCV': data.bs_bcv,
            'Total Paralelo': data.bs_paralelo,
            'Diferencia en $': data.diff_bs,
            'Diferencia en Bs': data.diff_usd,
            'Total en Bs': values['Monto $'] - data.diff_usd
        };
    }

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
    const results = calculos(values, calculadora['base'].value);
    const data = [
        Object.entries(values),
        Object.entries(results)
    ];

    return data;
};

const addItemsToCloneTable = (values, locale, options, cloneReporteTabla) => {
    const data = getDataReports(values);
    let cont = 0;

    if (calculadora['base'].value === 'usd') 
    {
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
    } 
    else 
    {
        data.forEach(element => {
            element.forEach(item => {
                if(cont == 3 || cont == 4 || cont == 5) {
                    cloneReporteTabla.cells[cont].textContent = transformToMoney(item[1], locale, options);
                }
                else {
                    cloneReporteTabla.cells[cont].textContent = transformToMoney(item[1]);
                }
                cont++;
            });
        });
    }

    return cloneReporteTabla;
};

const addItemsToCloneList = (values, locale, options) => {
    const data = getDataReports(values);
    const fragmentResultadoSm = document.createDocumentFragment();
    let cont = 0;

    if (calculadora['base'].value === 'usd') 
    {
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
    } 
    else 
    {
        data.forEach(element => {
            element.forEach(item => {
                if(cont == 3 || cont == 4 || cont == 5) {
                    fragmentResultadoSm.appendChild(createItemToListResultSm(item[0], transformToMoney(item[1], locale, options)));
                }
                else {
                    fragmentResultadoSm.appendChild(createItemToListResultSm(item[0], transformToMoney(item[1])));
                }
                cont++;
            });
        });
    }

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
    const key = (data.fuente == 'oficial') ? 'bcv' : 'paralelo';

    calculadora[key].value = parseFloat(data.promedio).toFixed(2);
};

const procesoFetch = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    cargarTasa(data);
};

const fetchTasa = (url) => {
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

        calculadora['monto'].focus();
    } 
    catch (error) 
    {
        console.log(error);
    }
};

window.addEventListener('load', (e) => {
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
            'Paralelo': calculadora['paralelo'].value
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