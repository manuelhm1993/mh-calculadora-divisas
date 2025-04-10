const calculadora = document.querySelector('#calculadora');
const resultado = document.querySelector('#resultado');
let baseCalculo;

//Templates
//Resolución +800
const resultadoTemplateMdLg = document.querySelector('#resultado-template-md-lg').content;
const reporteTablaTemplate = document.querySelector('#reporte-tabla-template').content;

//Resolución -800
const resultadoTemplateSm = document.querySelector('#resultado-template-sm').content;
const reporteListaTemplate = document.querySelector('#reporte-lista-template').content;

//URL de la API https://dolarapi.com/docs/
const urlTasasDolarApi = {
    bcv: 'https://ve.dolarapi.com/v1/dolares/oficial',
    paralelo: 'https://ve.dolarapi.com/v1/dolares/paralelo'
    //binance: 'https://ve.dolarapi.com/v1/dolares/bitcoin'
};

//URL de la API https://docs.pydolarve.org/
const urlTasasPyDolarVe = 'https://pydolarve.org/api/v1/dollar?format_date=default&rounded_price=true';

//Asignar el API a utilizar
const urlTasas = urlTasasDolarApi;

//Permite consultar la API solo al cargar la página
const tasasCache = {};

const reset = (caller = 'resetear') => {
    baseCalculo = calculadora['base'][0].checked;

    calculadora['bcv'].value = tasasCache.bcv;
    calculadora['paralelo'].value = tasasCache.paralelo;
    calculadora['monto'].value = '';
    calculadora['base'][0].checked = true;

    if(caller == 'resetear') resultado.textContent = '';
};

const calcularUSD = (values) => {
    //Realizar los cálculos
    const bs_bcv = values['Monto'] * values['BCV'];
    const bs_paralelo = values['Monto'] * values['Paralelo'];
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
    const bs_bcv = values['Monto'] / values['BCV'];
    const bs_paralelo = values['Monto'] / values['Paralelo'];
    const diff_usd = bs_bcv - bs_paralelo;
    const diff_bs = diff_usd * values['Paralelo'];

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
    
    const results = {
        'Total BCV': data.bs_bcv,
        'Total Paralelo': data.bs_paralelo,
    };

    if(base === 'usd') {
        results['Diferencia Bs'] = data.diff_bs;
        results['Diferencia $'] = data.diff_usd;
        results['Total $'] = values['Monto'] - data.diff_usd;
    }
    else 
    {
        results['Diferencia $'] = data.diff_usd;
        results['Diferencia Bs'] = data.diff_bs;
        results['Total Bs'] = values['Monto'] - data.diff_bs;
    }

    return results;
};

const transformToMoney = (number, locale = "es-ve", options = { style: "currency", currency: "VES", maximumFractionDigits: 2 }) => {
    return new Intl.NumberFormat(locale, options).format(number);
};

const transformToMoneyReverse = (formattedMoney, locale = "es-ve", currencySymbol = "Bs.S") => {
    // Elimina el símbolo de la moneda y los caracteres no numéricos
    const cleanedString = formattedMoney.replace(new RegExp(`[^0-9${locale === "es-ve" ? ",." : ".,"}]`, "g"), "");
    // Reemplaza la coma por punto (en formato Venezuela)
    const floatValue = locale === "es-ve" 
      ? cleanedString.replace(",", ".")  // Cambiar coma decimal por punto en Venezuela
      : cleanedString;  // Para formato US, ya está con punto decimal
    
    return floatValue.substr(1);  // Convertimos el string a número flotante
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

const addItemsToCloneTable = (values, locale, options, cloneReporteTabla, cloneResultadoMdLg) => {
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
                cloneResultadoMdLg.cells[cont].textContent = item[0];

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

    cloneReporteTabla = addItemsToCloneTable(values, locale, options, cloneReporteTabla, cloneResultadoMdLg.querySelector('table thead tr'));

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

const cargarTasa = (data, api) => {
    if(api == 'dolarapi')
    {
        const key = (data.fuente == 'oficial') ? 'bcv' : 'paralelo';
        const value = parseFloat(data.promedio).toFixed(2);

        tasasCache[key] = value;
        calculadora[key].value = value;
    }
    else 
    {
        tasasCache['bcv'] = data.monitors.bcv.price;
        tasasCache['paralelo'] = data.monitors.enparalelovzla.price;

        Object.entries(tasasCache).forEach(element => {
            calculadora[element[0]].value = parseFloat(element[1]).toFixed(2);
        });
    }

    console.log(api);
    console.log(tasasCache);
};

const procesoFetch = async (url, api = 'dolarapi') => {
    try 
    {
        const header = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const res = (api == 'dolarapi') ? await fetch(url) : await fetch(url, header);
        const data = await res.json();

        cargarTasa(data, api);
    }
    catch (error) 
    {
        console.log(error);
    }
};

const fetchTasa = (url) => {
    if(typeof url === 'string') 
    {
        procesoFetch(url, 'pydolarve');
    }
    else 
    {
        Object.values(url).forEach(element => {
            procesoFetch(element);
        });
    }

    calculadora['monto'].focus();
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
            'Monto': calculadora['monto'].value,
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

function parseLocaleNumber(stringNumber, locale) {
    var thousandSeparator = Intl.NumberFormat(locale).format(11111).replace(/\p{Number}/gu, '');
    var decimalSeparator = Intl.NumberFormat(locale).format(1.1).replace(/\p{Number}/gu, '');

    return parseFloat(stringNumber
        .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
        .replace(new RegExp('\\' + decimalSeparator), '.')
    );
}

document.addEventListener('click', (e) => {
    if(e.target.id == 'btnExportPDF')
    {
        const element = document.querySelector("#resultado");

        html2canvas(element).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jspdf.jsPDF("p", "mm", "a4");
            pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
            pdf.save("reporte-divisas.pdf");
        });
    }

    if(e.target.id == 'btnExportExcel')
    {
        const screenWidth = window.innerWidth;

        //Imprimir el reporte
        if(screenWidth >= 800) {
            const tabla = document.querySelector("#resultado");
            const wb = XLSX.utils.table_to_book(tabla, {
                sheet: "Divisas",
            });
            XLSX.writeFile(wb, "reporte-divisas.xlsx");
        }
        else {
            const lista = document.querySelector("#resultado .card .list-group div small");
            const monto = (baseCalculo) ? transformToMoneyReverse(lista.textContent, "en-US", "$") : transformToMoneyReverse(lista.textContent)

            const report = getDataReports({
                'Monto': monto,
                'BCV': calculadora['bcv'].value,
                'Paralelo': calculadora['paralelo'].value
            });

            let datos = [];
            
            report.forEach(element => {
                element.forEach(item => {
                    datos.push({tipo: item[0], valor: item[1]});
                });
            });

            const ws = XLSX.utils.json_to_sheet(datos);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Divisas");
            XLSX.writeFile(wb, "reporte-divisas.xlsx");
        }
    }
});