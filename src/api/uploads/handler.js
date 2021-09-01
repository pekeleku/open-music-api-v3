class UploadsHeader {
  constructor(storageService, validator) {
    this._storageService = storageService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { data } = request.payload;
    this._validator.validateImagesHeaders(data.hapi.headers);

    const filename = await this._storageService.writeFile(data, data.hapi);

    const response = h.response({
      status: 'success',
      data: {
        pictureUrl: `http://${process.env.HOST}:${process.env.PORT}/uploads/pictures/${filename}`,
      },
    });
    response.code(201);
    return response;
  }
}
module.exports = UploadsHeader;
