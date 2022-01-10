import {html, render} from 'https://unpkg.com/lit-html?module';
export {html, render} from 'https://unpkg.com/lit-html?module';

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


export const createRow = obj => html`
    <tr>
        ${Object.keys(obj).map(k =>
                html`
                    <td>${obj[k]}</td>`
        )}
    </tr>`;

export const createDataTable = data => html`
    <table>
        <thead>
        <tr>
            ${data.length === 0
                    ? html`
                        <th>no rows</th>`
                    : Object.keys(data[0]).map(h => html`
                        <th>${h}</th>`)
            }
            <th><button class="new-item" onclick="newItem()">+Add</button></th>
        </tr>
        </thead>
        <tbody>
        ${data.map(createRow)}
        </tbody>
    </table>`;

export const createOption = n => html`<option name="${n}">${n}</option>`;
export const createOptions = tabs =>     html`${tabs.map(createOption)}`;

export const newItem = () => console.log('newItem');
