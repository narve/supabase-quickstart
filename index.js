const supabaseRemotes = "supabaseRemotes";

const loadRemotes = () => JSON.parse(window.sessionStorage.getItem(supabaseRemotes) || "{}");
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
    }
];

const extractFormVals = form => {
    const res = {};
    for (const input of form.querySelectorAll("input[type=text]")) {
        res[input.name] = input.value;
    }
    return res;
}

const initializePage = () => {
    showRemotes(); 
    for (const action of actions) {
        console.log('Processing action: ', action);
        for (const form of document.querySelectorAll("." + action.ref)) {
            console.log(' Form: ', form, form.querySelector('input[type=button]'));
            form.querySelector('input[type=button]').addEventListener('click', e => {
                const formVals = extractFormVals(form);
                console.log('Processing form: ', action.ref, formVals);
                action.onClick(formVals);
                // e.stopPropagation();
                // return true;
            });
        }
    }
}


document.addEventListener('DOMContentLoaded', initializePage); 
