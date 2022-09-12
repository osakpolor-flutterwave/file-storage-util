import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import DownloadModel, { Download }from '../../models/download';
import { deleteDownload, findDownload } from '../../dal/download';
import s3Delete from '../../utils/s3.delete';
import Logger from '../../utils/Logger';

const spec = joi.object({
    account_id: joi.string().trim().required(),
    id: joi.string().required()
})

export async function deletes(data: any) {
   
    try {
      const params = validateSchema(spec, data);

      const item = await findDownload({
         _id: params.id, 
         accountid: params.account_id},
         DownloadModel,
         'one'
         )
      console.log('item---',item);
      if(!item) throw new Error('Item not found or already deleted.');
      const is_deleted = await deleteDownload({ _id: params.id, accountid: params.account_id},DownloadModel)
      if(is_deleted) await s3Delete({filename:item.key});

      return {
           data:null,
           message:'delete successful'
        }

    } catch (error: any) {
        console.log('err---',error);
        if(error.message.includes('Cast'))error.message = 'Please pass a valid id.';
        Logger.errorX([error, error.stack, new Date().toJSON()], 'FETCH-UPLOADS-ERRROR');
        throwcustomError(error.message);
    }
}