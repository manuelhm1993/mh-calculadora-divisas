const resultado = document.querySelector('#resultado');
const tr = document.querySelector('#resultado table tbody tr');
const calculadora = document.querySelector('#calculadora');

const transformToMoney = (number, locale = "es-ve", options = { style: "currency", currency: "VES", maximumFractionDigits: 2 }) => {
    return new Intl.NumberFormat(locale, options).format(number);
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
        const bcv = calculadora['bcv'].value;
        const paralelo = calculadora['paralelo'].value;
        const monto = calculadora['monto'].value;

        //Realizar los cálculos
        let bs_bcv = monto * bcv; 
        let bs_paralelo = monto * paralelo;
        let diff_bs = bs_paralelo - bs_bcv;
        let diff_usd = (paralelo > 0) ? diff_bs / paralelo : 0;

        //Definir el formato moneda
        const locale = 'en-US';
        const options = { style: "currency", currency: "USD", maximumFractionDigits: 2 };

        //Cargar los datos en el reporte
        tr.innerHTML = '';
        tr.innerHTML = `
            <td>${transformToMoney(monto, locale, options)}</td>
            <td>${transformToMoney(bcv)}</td>
            <td>${transformToMoney(paralelo)}</td>
            <td>${transformToMoney(bs_bcv)}</td>
            <td>${transformToMoney(bs_paralelo)}</td>
            <td>${transformToMoney(diff_bs)}</td>
            <td>${transformToMoney(diff_usd, locale, options)}</td>
            <td>${transformToMoney((monto - diff_usd), locale, options)}</td>
        `;

        reset(calculadora.id);
    }
});