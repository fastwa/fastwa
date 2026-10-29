import { PipeTransform } from '../common';

export class ApplicationConfig {
  private globalPipes: Array<PipeTransform> = [];

  public getGlobalPipes() {
    return this.globalPipes;
  }

  public useGlobalPipes(...pipes: PipeTransform[]) {
    this.globalPipes = this.globalPipes.concat(...pipes);
  }
}
