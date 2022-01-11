    
    drop view tables;
    
    create view tables
    as
    SELECT
    tables.table_name,
    obj_description(tables.table_name::regclass::oid, 'pg_class') table_comment,
    tables.table_catalog,
    tables.table_schema,
    tables.table_name::regclass::oid table_oid,
    tables.table_type,
    tables.self_referencing_column_name,
    tables.reference_generation,
    tables.user_defined_type_catalog,
    tables.user_defined_type_schema,
    tables.user_defined_type_name,
    tables.is_insertable_into,
    tables.is_typed,
    tables.commit_action
    FROM information_schema.tables;
    
    alter table tables
    owner to supabase_admin;
    
    grant delete, insert, references, select, trigger, truncate, update on tables to postgres;
    
    grant delete, insert, references, select, trigger, truncate, update on tables to anon;
    
    grant delete, insert, references, select, trigger, truncate, update on tables to authenticated;
    
    grant delete, insert, references, select, trigger, truncate, update on tables to service_role;
    
    
    
    
    select * from columns
    
    
    drop view columns;
    
    create view columns
    as
    SELECT
    columns.column_name,
    col_description(tables.table_name::regclass::oid, columns.ordinal_position) column_comment,
    columns.table_name,
    columns.table_name::regclass::oid table_oid,
    obj_description(tables.table_name::regclass::oid, 'pg_class') table_comment,
    columns.table_catalog,
    columns.table_schema,
    columns.character_maximum_length,
    columns.data_type,
    columns.column_default
    FROM information_schema.columns
    inner join information_schema.tables
    on columns.table_catalog = tables.table_catalog
    and columns.table_schema = tables.table_schema
    and columns.table_name = tables.table_name
    where tables.table_schema = 'public';
    
    select * from tables where table_schema = 'public'
    
    select count(*) from columns
    select * from columns
    where column_comment is not null
    where table_schema = 'public'
    
    alter view columns
    owner to supabase_admin;
    
    comment on column par
    
    grant delete, insert, references, select, trigger, truncate, update on columns to postgres;
    
    grant delete, insert, references, select, trigger, truncate, update on columns to anon;
    
    grant delete, insert, references, select, trigger, truncate, update on columns to authenticated;
    
    grant delete, insert, references, select, trigger, truncate, update on columns to service_role;
    
