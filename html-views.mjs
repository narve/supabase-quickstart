import {html, render} from 'https://unpkg.com/lit-html?module';

export const createNav = tabs =>
    html`
        <nav>
            <ol>
                ${tabs.map(n => html`
                    <li>
                        <a href="#${n.id}">${n.title}</a>
                    </li>`
                )}
            </ol>
        </nav>
    `;


export const renderRow = obj => html`
    <tr>
        ${Object.keys(obj).map(k =>
                html`
                    <td>${obj[k]}</td>`
        )}
    </tr>`;

export const renderFunc = render;

export const renderTable = data => html`
    <table>
        <thead>
        <tr>
            ${data.length === 0
                    ? html`
                        <th>no rows</th>`
                    : Object.keys(data[0]).map(h => html`
                        <th>${h}</th>`)
            }
        </tr>
        </thead>
        <tbody>
        ${data.map(renderRow)}
        </tbody>
    </table>`;
