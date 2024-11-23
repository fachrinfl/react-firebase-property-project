export default function imageUrlFormatter(imagePath: string) {
  return `https://firebasestorage.googleapis.com/v0/b/react-property-project.firebasestorage.app/o/${encodeURIComponent(
    imagePath
  )}?alt=media`;
}
