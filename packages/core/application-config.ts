import { PipeTransform } from '@fastwa/common';

export class ApplicationConfig {
  private globalPipes: Array<PipeTransform> = [];

  public getGlobalPipes() {
    return this.globalPipes;
  }

  public useGlobalPipes(...pipes: PipeTransform[]) {
    this.globalPipes = this.globalPipes.concat(...pipes);
  }
}
