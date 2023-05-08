import { v4 } from 'uuid';
import { CronJob } from 'cron';

import { Injectable, OnBootstrap, Type } from '@fastwa/common';

@Injectable()
export class ScheduleService implements OnBootstrap {
  private readonly createdJobs = {};
  private readonly cronJobs = new Map<string, CronJob>();

  onBootstrap() {
    this.mountCronJobs();
  }

  mountCronJobs() {
    const keys = Object.keys(this.createdJobs);

    keys.forEach((key) => {
      const { time, callback, instance } = this.createdJobs[key];

      const cronJob = new CronJob(
        time,
        callback.bind(instance),
        undefined,
        false
      );

      cronJob.start();

      this.createdJobs[key].ref = cronJob;
      this.addJob(key, cronJob);
    });
  }

  createJob(callback: Function, time: string, instance: Type<any>) {
    const id = v4();

    this.createdJobs[id] = {
      callback,
      time,
      instance
    };
  }

  addJob(name: string, job: CronJob) {
    this.cronJobs.set(name, job);
  }
}
