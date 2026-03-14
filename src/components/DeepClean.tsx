import back from "../assets/icons/back-button.png";

type Props = {
  onBack: () => void
};

export default function DeepCleanPage({ onBack }: Props) {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 font-medium"
        >
          <img src={back} alt="Back" className="w-12 h-12" />
        </button>
        <h2 className="text-3xl font-bold">Deep Clean</h2>
      </div>

      <p className="text-gray-600 mb-6">
        This action will permanently remove:
        <br />• All files
        <br />• All favourite items
        <br />• Cached data
      </p>

      
    </div>
  );
}
