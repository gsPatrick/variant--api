// Foto anexada a um evento da safra. Exibida no pop-up de detalhamento do
// evento. Armazena a URL/caminho no storage e metadados do arquivo.
module.exports = (sequelize, DataTypes) => {
  const EventPhoto = sequelize.define(
    'EventPhoto',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_id',
      },
      // URL ou caminho do arquivo no storage (S3, disco, etc.).
      url: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      caption: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'file_name',
      },
      // Tamanho do arquivo em bytes.
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'mime_type',
      },
    },
    {
      tableName: 'event_photos',
      underscored: true,
      timestamps: true,
    }
  );

  return EventPhoto;
};
