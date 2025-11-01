import vine from '@vinejs/vine'

export const ingestRoverImageValidator = vine.compile(
  vine.object({
    img_src: vine.string().url(),
    sol: vine.number().min(0),
    roverId: vine.number().min(1),
    camera: vine.string().maxLength(100),
    title: vine.string().maxLength(255).optional(),
    credits: vine.string().maxLength(255).optional(),
  })
)

export const ingestRoverImageBatchValidator = vine.compile(
  vine.object({
    images: vine
      .array(
        vine.object({
          img_src: vine.string().url(),
          sol: vine.number().min(0),
          roverId: vine.number().min(1),
          camera: vine.string().maxLength(100),
          title: vine.string().maxLength(255).optional(),
          credits: vine.string().maxLength(255).optional(),
        })
      )
      .minLength(1)
      .maxLength(1000),
  })
)


