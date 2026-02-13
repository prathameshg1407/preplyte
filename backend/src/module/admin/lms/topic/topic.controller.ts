import { Request, Response } from 'express';
import { topicService } from './topic.service';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { createTopicSchema, updateTopicSchema } from './topic.validation';

export class TopicController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const topic = await topicService.create(req.body);
        return sendCreated(res, topic, 'Topic created successfully');
    });

    findOne = asyncHandler(async (req: Request, res: Response) => {
        const topic = await topicService.findOne(req.params.id);
        return sendSuccess(res, topic);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const topic = await topicService.update(req.params.id, req.body);
        return sendSuccess(res, topic, 'Topic updated successfully');
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        await topicService.delete(req.params.id);
        return sendNoContent(res);
    });

    findByModule = asyncHandler(async (req: Request, res: Response) => {
        const topics = await topicService.findByModule(req.params.moduleId);
        return sendSuccess(res, topics);
    });
}


export const topicController = new TopicController();