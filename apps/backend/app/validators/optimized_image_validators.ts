import vine from '@vinejs/vine'

export const optimizedImageValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    roverId: vine.number().optional(),
    cameraCode: vine.string().maxLength(22).optional(),
    rover: vine.string().maxLength(20).optional(),
    camera: vine.string().maxLength(20).optional(),
    begin_sol: vine.number().min(0).optional(),
    end_sol: vine.number().min(0).optional(),
  })
)

export const esaImageSearchValidator = vine.compile(
  vine.object({
    search: vine.string().minLength(2).maxLength(100),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional()
  })
)

export const roverImageSearchValidator = vine.compile(
  vine.object({
    rover: vine.string(),
    camera: vine.string().maxLength(22),
    begin_sol: vine.number().min(0),
    end_sol: vine.number().min(0),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional()
  })
)

export const statsValidator = vine.compile(
  vine.object({
    detailed: vine.boolean().optional()
  })
)

export const createRoverImageValidator = vine.compile(
  vine.object({
    imgSrc: vine.string().url(),
    sol: vine.number().min(0),
    roverId: vine.number().min(1),
    cameraCode: vine.string().maxLength(10),
    title: vine.string().maxLength(255).optional(),
    credits: vine.string().maxLength(255).optional()
  })
)

export const createEsaImageValidator = vine.compile(
  vine.object({
    esaId: vine.string().maxLength(50),
    imgSrc: vine.string().url(),
    imgFullSize: vine.string().url().optional(),
    title: vine.string().maxLength(255),
    credits: vine.string().maxLength(255).optional(),
    constellation: vine.string().maxLength(100).optional(),
    fov: vine.string().maxLength(20).optional(),
    releaseDate: vine.string().maxLength(50).optional(),
    type: vine.enum(['JWST', 'HUBBLE', 'OTHER'])
  })
)

export const batchCreateValidator = vine.compile(
  vine.object({
    images: vine.array(
      vine.object({
        esaId: vine.string().maxLength(50).optional(),
        imgSrc: vine.string().url(),
        imgFullSize: vine.string().url().optional(),
        title: vine.string().maxLength(255),
        sol: vine.number().min(0).optional(),
        roverId: vine.number().min(1).optional(),
        cameraCode: vine.string().maxLength(10).optional(),
        credits: vine.string().maxLength(255).optional(),
        constellation: vine.string().maxLength(100).optional(),
        fov: vine.string().maxLength(20).optional(),
        releaseDate: vine.string().maxLength(50).optional(),
        type: vine.enum(['JWST', 'HUBBLE', 'OTHER']).optional()
      })
    ).minLength(1).maxLength(1000)
  })
)
