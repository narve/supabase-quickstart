const supabaseRemotes = "supabaseRemotes";


// import {createClient} from '@supabase/supabase-js'
// import supabase from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
// import supabase from 'https://unpkg.com/@supabase/supabase-js@1.24.0/dist/module/SupabaseClient.js';

const {createClient} = supabase;

const initialRemotes = {
    name: "narve",
    base_url: "https://xupzhicrqmyvtgztrmjb.supabase.co",
    client_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMDExNjg5NCwiZXhwIjoxOTI1NjkyODk0fQ.cvK8Il2IbFqU03Q4uOhSQ9jxFkWELLACX7mJKyy_Ue0',
};

const loadRemotes = () => JSON.parse(window.sessionStorage.getItem(supabaseRemotes) || "null") || initialRemotes;
const saveRemotes = vals => window.sessionStorage.setItem(supabaseRemotes, JSON.stringify(vals));

// saveRemotes({});

const showRemotes = () => {
    console.log('showSupabaseConfiguration: ', loadRemotes());
    const configs = JSON.stringify(loadRemotes());
    for (const element of document.querySelectorAll(".supabase_config_info")) {
        element.innerText = configs;
    }
};

const actions = [
    {
        ref: 'set_remote',
        onClick: formVals => {
            const remotes = loadRemotes();
            remotes[formVals.name] = formVals;
            saveRemotes(remotes);
            showRemotes();
        }
    },
    {
        ref: 'register_user',
        onClick: formVals => {
            // const remotes = loadRemotes();
            // remotes[formVals.name] = formVals;
            // saveRemotes(remotes);
            // showRemotes();
        }
    },
    {
        ref: 'load_metadata',
        onClick: async () => {
            const config = loadRemotes();
            const supabase = createClient(config.base_url, config.client_key);
            const res = await supabase.from('tables').select(`*`).eq("table_schema", 'public');
            const {data, error} = res;
            if (data) {
                populateTableSelector(data);
            }
            const output = document.getElementById("api-result-json");
            output.innerText = JSON.stringify(error || data, null, " ",);
        }
    },
    {
        ref: 'show_table',
        onClick: async formVals => {
            const table = formVals['tables'];
            console.log('table: ', formVals);

            const config = loadRemotes();
            const supabase = createClient(config.base_url, config.client_key);
            const res = await supabase.from(table).select(`*`);
            const {data, error} = res;
            if (data) {
                populateTableSelector(data);
            }
            const jsonHolder = document.getElementById("api-result-json");
            const htmlHolder = document.getElementById("api-result-html");
            jsonHolder.innerText = JSON.stringify(error || data, null, " ",);

            // const myTemplate = (name) => html`<p>Hello ${name}</p>`;
            const renderModule = await import('./html-views.js');
            console.log('renderModule: ', renderModule);
            const {renderTable, renderFunc} = renderModule;
            console.log('renderTable: ', renderTable);
            const templateResult = renderTable(data);
            console.log('templateResult: ', templateResult);

            // htmlHolder.innerText = "" + templateResult;

            // Render the template to the document
            renderFunc(templateResult, htmlHolder);
        },
    }
];

const populateTableSelector = data => {
    const selectors = document.querySelectorAll('.table-option-holder');
    for (const selector of selectors) {
        data.map(r => r.table_name).forEach((n, i) => {
            const option = document.createElement('option', {name: 'asdf'});
            option.innerText = n;
            selector.append(option);
            if (i === 0) option.selected = true;
        });
    }
}


const extractFormVals = form => {
    const res = {};
    for (const input of form.querySelectorAll("input[type=text], select")) {
        res[input.name] = input.value;
    }
    return res;
}

const initializePage = () => {
    for (const action of actions) {
        console.log('Configuring action: ', action);
        for (const form of document.querySelectorAll("." + action.ref)) {
            // console.log(' Form: ', form, form.querySelector('input[type=button]'));
            const button = form.querySelector('input[type=button], input[type=submit], button');
            console.log(`   ${action}: ${!!form}, ${!!button}`)
            button.addEventListener('click', e => {
                const formVals = extractFormVals(form);
                console.log('Processing form: ', action.ref, formVals);
                action.onClick(formVals);
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        }
    }
    showRemotes();
    actions.find(a => a.ref === 'load_metadata').onClick();
}


document.addEventListener('DOMContentLoaded', initializePage);
