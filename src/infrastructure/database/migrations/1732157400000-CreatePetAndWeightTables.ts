import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePetAndWeightTables1732157400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create pet table
    await queryRunner.createTable(
      new Table({
        name: 'pet',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create weight table
    await queryRunner.createTable(
      new Table({
        name: 'weight',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'pet_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'weight',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'weight',
      new TableForeignKey({
        columnNames: ['pet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pet',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('weight');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('pet_id') !== -1
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('weight', foreignKey);
      }
    }

    await queryRunner.dropTable('weight');
    await queryRunner.dropTable('pet');
  }
}
