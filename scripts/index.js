import {createDataTable, createNav, createOptions, createTableLinks, html, render} from './html-views.mjs';
import {colVal, processOpenApi} from "./supa-openapi.mjs";

const {createClient} = supabase;


const supabaseRemotes = "supabaseRemotes";
const activeRemote = "narve";

const initialRemotes = [{
    name: "narve",
    base_url: "https://xupzhicrqmyvtgztrmjb.supabase.co",
    client_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMDExNjg5NCwiZXhwIjoxOTI1NjkyODk0fQ.cvK8Il2IbFqU03Q4uOhSQ9jxFkWELLACX7mJKyy_Ue0',
}];

const loadRemotes = () => JSON.parse(window.sessionStorage.getItem(supabaseRemotes) || "null") || initialRemotes;
const saveRemotes = vals => window.sessionStorage.setItem(supabaseRemotes, JSON.stringify(vals));

const getActiveConfig = () => {
    const configs = loadRemotes();
    const cfgName = window.sessionStorage.getItem(activeRemote) || 'narve';
    return configs.find(c => c.name === cfgName);
}


export const showRemotes = () => {
    const remotes = loadRemotes();
    console.log('showSupabaseConfiguration: ', remotes);

    const configs = JSON.stringify(remotes);
    for (const element of document.querySelectorAll(".supabase_config_info")) {
        element.innerText = configs;
    }

    const optionHolder = document.getElementById('config-option-holder');
    optionHolder.innerHTML = "";
    render(createOptions(remotes.map(n => n.name)), optionHolder);
};

const getClient = () => {
    const config = getActiveConfig();
    return createClient(config.base_url, config.client_key);
};


const actions = [
    {
        ref: 'choose-remote',
        onClick: formVals => {
            console.log('Applying supa-base-config: ', formVals);
            const cfg = loadRemotes().find(c => c.name === formVals.name);
            window.sessionStorage.setItem(activeRemote, formVals.name);
            const f = document.querySelector('form.set_remote');
            setFormVals(cfg, f);
            actions.find(a => a.ref === 'load_metadata').onClick();
        }
    },
    {
        ref: 'set_remote',
        onClick: formVals => {
            const remotes = loadRemotes();
            const oldIndex = remotes.findIndex(x => x.name === formVals.name);
            console.log('Remotes pre: ', remotes, 'oldIndex: ', oldIndex);
            if (oldIndex >= 0) remotes.splice(oldIndex);
            // remotes[formVals.name] = formVals;
            remotes.push(formVals);
            saveRemotes(remotes);
            showRemotes();
            return 'done';
        }
    },
    {
        ref: 'register_user',
        onClick: async formVals => {
            return await getClient().auth.signUp({
                email: formVals['email'],
                password: formVals['password']
            });
        }
    },
    {
        ref: 'logout',
        onClick: async formVals => {
            const res = await getClient().auth.signOut();
            window.localStorage.setItem('supabase.auth.token', null);
            return res;
        }
    },
    {
        ref: 'login_with_password',
        onClick: async formVals => {
            return await getClient().auth.signIn({
                email: formVals['email'],
                password: formVals['password']
            });
        },
    },
    {
        ref: 'show_user_info',
        onClick: formVals => getClient().auth.user()
    },
    {
        ref: 'load_metadata',
        onClick: async () => {
            const {data, error} = await getClient().from('').select(`*`);
            console.log('Fetched tables: ', data, error);
            if (data) {
                processOpenApi(data);
                populateTableSelector(data);
            }
            for (const output of document.querySelectorAll(".api-result-json")) {
                output.innerText = JSON.stringify(error || data, null, " ",);
            }
        }
    },
    {
        ref: 'show_table',
        onClick: async (formVals, form) => {
            const tableName = formVals['table'];
            console.log('table: ', formVals?.table);

            const {data: openApi} = await getClient().from("").select('*');
            processOpenApi(openApi);

            const table = openApi.definitions[tableName];

            const fksToLoad = Object.values(table.properties)
                .filter(prop => prop.isFk);
            // console.log('fkstoload: ', fksToLoad);
            // console.log('using table: ', table);


            let select = "*";
            for (const fk of fksToLoad) {
                select += `, ${fk.fk.table} ( id, ${fk.fk.select} )`;
            }
            // console.log('using select: ', select);

            const res = await getClient().from(tableName).select(select);
            const {data, error} = res;

            // This is to make the selector nice again: 
            if (form)
                setFormVals({table: ''}, form);

            for (const jsonHolder of document.querySelectorAll(".api-result-json")) {
                jsonHolder.innerText = JSON.stringify(error || data, null, " ",);
            }

            const htmlHolder = document.getElementById("api-result-html");
            render(createDataTable(data, tableName), htmlHolder);

        }
    },
    {
        ref: "create",
        onClick: async (formVals, form) => {
            console.log('should create: ', {formVals, form});

            const obj = {...formVals};
            delete obj.submit;
            delete obj.type;
            return await getClient().from(formVals.type).insert([
                obj
            ]);
        }
    },
    {
        ref: "delete",
        onClick: async (formVals, form) => {
            console.log('should create: ', {formVals, form});
            if (!formVals.id || !formVals.table) {
                throw new Error('Missing data for delete!"')
            }
            return await getClient().from(formVals.table).delete().eq('id', formVals.id);
        }
    },
];

const populateTableSelector = openApi => {
    // populateTableSelectorForm(data);
    populateTableLinks(openApi);

}

// const populateTableSelectorForm = data => {
//     const selector = document.querySelector('.table-option-holder');
//     render(createOptions(data.definitions.map(d => d.id)), selector);
// }

const populateTableLinks = data => {
    console.log('table-links: ', data);
    const selector = document.querySelector('.table-links-holder');
    const names = Object.keys(data.definitions);
    render(createTableLinks(names), selector);
}

const setFormVals = (vals, form) => {
    for (const k in vals) {
        console.log({vals, k});
        const element = form.querySelector(`[name=${k}]`);
        if (element) element.value = vals[k];
    }
}

const extractFormVals = form => {
    const res = {};
    for (let input of form.querySelectorAll("input, select")) {
        console.log('   => ', typeof input, input.name, !!input.name, input.inputType, input.type, input.attributes['type'], input);
        res[input.name || input.attributes['type'].value] = input.value;
    }
    return res;
}

const configureForms = () => {
    const n = {
        forms: {},
    }
    document['n'] = n;
    for (const action of actions) {
        console.log('Configuring action: ', action.ref);
        for (const form of document.querySelectorAll("." + action.ref)) {
            // console.log(' Form: ', form, form.querySelector('input[type=button]'));
            const button = form.querySelector('input[type=button], input[type=submit], button');
            const output = form.querySelector('.output');
            const inputs = form.querySelectorAll('input, select');
            for (let input of inputs) {
                input.addEventListener('change', () => {
                    console.log('form ' + action.ref + ": " + form.checkValidity());
                    return button.disabled = !form.checkValidity();
                });
            }
            // console.log(`   ${action}: ${!!form}, ${!!button}`);
            n.forms[action.ref] = form;
            if (button) {
                button.addEventListener('click', e => {
                    const formVals = extractFormVals(form);
                    console.log('Processing form: ', action.ref, formVals);
                    action.onClick(formVals, form)
                        .then(result => {
                            console.log('  action result: ', result);
                            if (output)
                                output.innerHTML = JSON.stringify(result);
                            console.log('Done with form ', action.ref);
                        });
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            }
            console.log('   ', action.ref, ' button: ', !!button, ' output: ', !!output);
        }
    }
    showRemotes();
    actions.find(a => a.ref === 'load_metadata').onClick();
}

const configureSections = () => {
    const sections = [...document.querySelectorAll('section')];
    for (const section of sections) {
        section.style.display = 'none';
    }
    const active = sections[1];
    active.style.display = null;

    const nav = createNav(sections);
    render(nav, document.body, {renderBefore: document.body.firstChild});

    const switchTab = () => {
        // console.log('Tab-switcher: ', location.hash);
        const hashEntries = location.hash
            .substring(1)
            .split(",")
            .map(pair => pair.split("="))
            .map(pair => ({key: pair[0], value: pair[1]}));
        const hashMap = hashEntries
            .reduce((map, obj) => {
                map[obj.key] = obj.value;
                return map;
            }, {});
        console.log('Tab-switcher 2: ', hashMap);

        for (const section of sections) {
            const active = hashMap.section === section.id;
            section.style.display = active ? null : 'none';
        }
        for (const a of document.querySelectorAll("nav a")) {
            a.classList.remove('active');
            // console.log('a: ', location.hash, a.href, a.href.endsWith(location.hash));
            if (a.href.endsWith(hashMap.section))
                a.classList.add('active');
        }

        if (hashMap.table) {
            const action = actions.find(a => a.ref === 'show_table');
            console.log('should show table: ', hashMap.table, action);
            action.onClick({table: hashMap.table});
            initializeCreateForm(hashMap);
            initializeDeleteForm(hashMap);
        }

    }

    // In case url already has a hashbang: 
    switchTab();
    window.addEventListener("hashchange", switchTab, false);
}

const initializePage = () => {
    configureForms();
    configureSections();
}


document.addEventListener('DOMContentLoaded', initializePage);

const initializeDeleteForm = async (hashMap) => {
    console.log('initialize delete form', hashMap.table);
    const form = document.querySelector(".delete");
    form.querySelector("input[name=table]").value = hashMap.table;
    form.querySelector("input[name=id]").value = hashMap.id;
}


const initializeCreateForm = async (args) => {
    const table = args.table;
    console.log('initialize create form', table);
    const {data} = await getClient().from("").select('*');
    processOpenApi(data);
    const propMap = data.definitions[table].properties;
    console.log('propMap: ', propMap);

    const props = Object.keys(propMap)
        .map(key => ({key, ...propMap[key]}))
        .filter(prop => !prop.isPk);

    console.log('props: ', props);

    const fksToLoad = props.filter(prop => prop.isFk);


    const dataListForProp = async prop => {
        const did = prop.fk.table + "." + prop.fk.column;
        const vals = await getClient().from(prop.fk.table).select('*');
        return html`
            <!--            <label>Datalist for ${prop.key} / ${prop.description}</label>-->
            <datalist id="${did}">
                ${vals.data.map(row => html`
                    <option value="${row[prop.fk.column]}" name="${colVal(row)}">
                        ${row.name || row.title || row.handle || row.id}
                    </option>
                `)}
            </datalist>`;
    };

    const propToInput = prop => {
        if (prop.fk) {
            const did = prop.fk.table + "." + prop.fk.column;
            return html`<input name="${prop.key}" type="text" list="${did}" required>`;
        }
        return html`<input name="${prop.key}" type="text" required>`;
    };

    const content = await html`
        ${await Promise.all(fksToLoad.map(async prop => await dataListForProp(prop)))}

        <label>Type:
            <input type="text" name="type" readonly disabled value="${table}">
        </label>

        ${props.map(prop => {
            return html`
                <!--                <span>${JSON.stringify(prop)}</span>-->
                <label>${prop.key}:
                    ${propToInput(prop)}
                </label>
            `;
        })}
    `;
    const holder = document.querySelector('.create-inputs');
    render(content, holder);
};
