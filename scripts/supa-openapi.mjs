const log = (...args) => console.debug("[oapi]", ...args);

export const titleProps = ['title', 'handle', 'name', 'id'];

export const processOpenApi = ({definitions}) => {
    log('Processing OpenAPI: ', definitions);

    for (const tableName in definitions) {
        log(' Processing ', tableName);
        const table = definitions[tableName];

        // Find the title property of the table:
        table.titleProp = titleProps.find(p => !!table.properties[p]);
        log('  title prop for ', tableName, table.titleProp);
    }


    // For each column, extract database-properties:
    // And set property name! 
    for (const tableName in definitions) {
        log(' Processing ', tableName);
        const table = definitions[tableName];

        for (const propName in table.properties) {
            log('   ', propName);
            const prop = table.properties[propName];
            prop.name = propName;
            prop.isPk = prop.description?.indexOf("<pk") >= 0;
            prop.isFk = prop.description?.indexOf("<fk") >= 0;
            if (prop.isFk) {
                const [, table, column] = [...prop.description.matchAll(/.*<fk table='(.*)' column='(.*)'.*/g)]
                    [0];
                prop.fk = {table, column, select: definitions[table].titleProp};
            }
        }
    }
};

export const colVal = col => {
    if (!col) return "";
    if (typeof col === "object") {
        const s = col['title'] || col['name'] || col['handle'] || col['id'];
        // return html`<a href="the-ref">${s}</a>`; 
        return s;
    }
    return col;
};

//
// export const titleColumn = (tab, id) => {
//     const remoteTable = template.data.definitions[tab];
// }
