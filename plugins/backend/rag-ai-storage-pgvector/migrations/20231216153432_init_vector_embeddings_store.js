/*
 * Copyright 2024 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const TABLE_NAME = 'embeddings';

exports.up = async function up(knex) {
  await knex.raw('create extension if not exists "uuid-ossp"');
  await knex.raw('create extension if not exists "vector"');
  await knex.schema.createTable(TABLE_NAME, table => {
    table.comment(
      'Stores embeddings of documents from the system to be used as RAG AI injectables. ',
    );
    table
      .uuid('id')
      .notNullable()
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .comment('UUID of the embedding');
    table
      .text('content')
      .notNullable()
      .comment('Actual content of the embedding. Chunks of text/data');
    table
      .jsonb('metadata')
      .notNullable()
      .comment(
        'Metadata of the embedding. Information like entityRef etc. that can be used to identify links to other parts of the system.',
      );
  });

  await knex.schema.raw(`ALTER TABLE ${TABLE_NAME}
      ADD vector vector NOT NULL ; `);
  await knex.schema.raw(`COMMENT ON COLUMN ${TABLE_NAME}.vector 
     IS 'Vector weights of the related content.';`);
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('embeddings');
  await knex.raw('drop extension if exists "uuid-ossp"');
  await knex.raw('drop extension if exists "vector"');
};
