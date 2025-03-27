const resultado = document.querySelector('#resultado');
const tr = document.querySelector('#resultado table tbody tr');
const separador = document.querySelector('.separador');
const calculadora = document.querySelector('#calculadora');

const transformToMoney = (number, locale = "es-ve", options = { style: "currency", currency: "VES", maximumFractionDigits: 2 }) => {
    return new Intl.NumberFormat(locale, options).format(number);
};

const reset = () => {
    calculadora['bcv'].value = '';
    calculadora['paralelo'].value = '';
    calculadora['monto'].value = '';
};

document.addEventListener('reset', (e) => {
    e.preventDefault();

    if(e.target.id == calculadora.id) {
        reset();
        resultado.style.display = 'none';
        separador.style.display = 'none';
    }
});

document.addEventListener('submit', (e) => {
    e.preventDefault();

    if(e.target.id == calculadora.id) {
        const bcv = calculadora['bcv'].value;
        const paralelo = calculadora['paralelo'].value;
        const monto = calculadora['monto'].value;
        let bs_bcv = monto * bcv; 
        let bs_paralelo = monto * paralelo;

        const locale = 'en-US';
        const options = { style: "currency", currency: "USD", maximumFractionDigits: 2 };

        tr.innerHTML = '';
        tr.innerHTML = `
        <td>${transformToMoney(monto, locale, options)}</td>
        <td>${transformToMoney(bcv)}</td>
        <td>${transformToMoney(paralelo)}</td>
        <td>${transformToMoney(bs_bcv)}</td>
        <td>${transformToMoney(bs_paralelo)}</td>
        <td>${transformToMoney((bs_paralelo - bs_bcv))}</td>
        <td>${transformToMoney(((bs_paralelo - bs_bcv) / paralelo), locale, options)}</td>
        <td>${transformToMoney((monto - ((bs_paralelo - bs_bcv) / paralelo)), locale, options)}</td>
        `;

        resultado.style.display = 'block';
        separador.style.display = 'block';

        reset();
    }
});