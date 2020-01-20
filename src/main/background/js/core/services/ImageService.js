import Injector from '~/main/background/js/infrastructure/injector/Injector';

export default @Injector.register(
  [],
  x => x.inSingletonScope()
)
class ImageService {
  contrastImage (imageData) {
    const data = imageData.data;
    const contrast = -55 / 100 + 1;
    const intercept = 128 * (1 - contrast);
    for (let i = data.length; i >= 0; i -= 4) {
      data[i] = data[i] * contrast + intercept;
      data[i + 1] = data[i + 1] * contrast + intercept;
      data[i + 2] = data[i + 2] * contrast + intercept;
    }

    return imageData;
  }
}
