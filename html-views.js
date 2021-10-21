import {html, render} from 'https://unpkg.com/lit-html?module';


export const renderRow = obj => html`
    <tr>
        <td>${JSON.stringify(obj)}</td>
    </tr>`;

export const renderFunc = render;

export const renderTable = data => html`
    <table border="1">
        <thead>
        <tr>
            <th>json</th>
        </tr>
        </thead>
        <tbody>
        ${data.map(renderRow)}
        </tbody>
    </table>`;

// const myTemplate = (name) => html`<p>Hello ${name}</p>`;


// import {html, render} from 'https://unpkg.com/lit-html?module';
