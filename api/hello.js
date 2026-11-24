
export default function handler(request, response) {
  response.status(200).json({
    success: true,
    message: "StudentHelper backend is working!"
  });
}
