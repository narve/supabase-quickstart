import {html} from 'https://unpkg.com/lit-html?module';
import {colVal} from "./supa-openapi.mjs";

export {html, render} from 'https://unpkg.com/lit-html?module';

export const createNav = tabs =>
    html`
        <nav>
            <ol>
                ${tabs.map(n => html`
                    <li>
                        <a href="#section=${n.id}">${n.title}</a>
                    </li>`
                )}
            </ol>
        </nav>
    `;


export const createRow = (obj, table) => html`
    <tr>
        ${Object.keys(obj).map(k =>
                html`
                    <td>${colVal(obj[k])}</td>`
        )}
        <td><a href="#section=delete,table=${table},id=${obj.id}">DELETE</a></td>
    </tr>`;

export const createDataTable = (data, table) => html`
    <table>
        <thead>
        <tr>
            ${
                    data.length === 0
                            ? html`
                                <th>no rows</th>`
                            : Object.keys(data[0]).map(h => html`
                                <th>${h}</th>`)
            }
            <th>
                    <!--                    <button class="new-item" @click="${() => newItem(table)}">+Add</button>-->
                <a href="#section=create,table=${table}" class="new-item"">+Add</a>
            </th>
        </tr>
        </thead>
        <tbody>
        ${(data ?? []).map(o => createRow(o, table))}
        </tbody>
    </table>`;

export const createOption = n => html`
    <option name="${n}">${n}</option>`;

export const createOptions = tabs => html`${tabs.map(createOption)}`;

export const createTableLink = n => html`
    <a href="#section=data,table=${n}">${n}</a>`;

export const createTableLinks = tabs => html`${tabs.map(createTableLink)}`;


export const newItem = table => console.log('newItem: ', table);
