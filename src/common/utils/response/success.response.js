export const successResponse = ({message = "Success", res, status = 200, data = undefined}) => {
  return res.status(status).json({ message, status, data });
}