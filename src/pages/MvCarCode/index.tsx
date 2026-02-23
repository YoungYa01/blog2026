import QRCodeDesigner from "@/pages/MvCarCode/components/QRCodeDesigner.tsx";

export default function MvCarCode() {
  return (
    <div className="bg-white mx-auto min-h-screen text-black">
      <div className="container mx-auto">
        <QRCodeDesigner />
          <footer >

          </footer>
      </div>
    </div>
  );
}
