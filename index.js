import {createDataTable, createNav, createOptions, render} from './html-views.mjs';

import {newItem} from './html-views.mjs';

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
    const supabase = createClient(config.base_url, config.client_key);
    return supabase;
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
        onClick: formVals => {
            const config = getActiveConfig();
            const supabase = createClient(config.base_url, config.client_key);
            const user = supabase.auth.user();

            // const output = document.getElementById('userinfo');
            // output.innerText = JSON.stringify(user);
            return user;

        }
    },
    {
        ref: 'load_metadata',
        onClick: async () => {
            const config = getActiveConfig();
            const supabase = createClient(config.base_url, config.client_key);
            const res = await supabase.from('tables').select(`*`).eq("table_schema", 'public');
            const {data, error} = res;
            console.log('Fetched tables: ', data, error);
            if (data) {
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
            const table = formVals['table'];
            console.log('table: ', formVals);

            const res = await getClient().from(table).select(`*`);
            const {data, error} = res;

            // This is to make the selector nice again: 
            setFormVals({table: ''}, form);

            return table;
            // if (data) {
            //     populateTableSelector(data);
            // }
            for (const jsonHolder of document.querySelectorAll(".api-result-json")) {
                jsonHolder.innerText = JSON.stringify(error || data, null, " ",);
            }

            const htmlHolder = document.getElementById("api-result-html");
            render(createDataTable(data), htmlHolder);

        },
    }
];

const populateTableSelector = data => {
    const selector = document.querySelector('.table-option-holder');
    render(createOptions(data.map(d => d.table_name)), selector);
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

const configureForms = async () => {
    const n = {
        forms: {},
    }
    document['n'] = n;
    for (const action of actions) {
        console.log('Configuring action: ', action);
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
            console.log(`   ${action}: ${!!form}, ${!!button}`);
            n.forms[action.ref] = form;
            button.addEventListener('click', async e => {
                const formVals = extractFormVals(form);
                console.log('Processing form: ', action.ref, formVals);
                const result = await action.onClick(formVals, form);
                console.log('  action result: ', result);
                if (output)
                    output.innerHTML = JSON.stringify(result);
                e.stopPropagation();
                e.preventDefault();
                console.log('Done with form ', action.ref);
                return false;
            });
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
        for (const section of sections) {
            const active = location.hash.indexOf(encodeURI(section.id)) >= 0;
            section.style.display = active ? null : 'none';
        }
        for (const a of document.querySelectorAll("nav a")) {
            a.classList.remove('active');
            console.log('a: ', location.hash, a.href, a.href.endsWith(location.hash));
            if (a.href.endsWith(location.hash))
                a.classList.add('active');
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
