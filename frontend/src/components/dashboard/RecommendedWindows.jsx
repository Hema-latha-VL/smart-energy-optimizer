const RecommendedWindows = ({ windows }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recommended Usage Windows</h2>
        <p className="card-subtitle">
          Best times to run your devices based on energy generation predictions
        </p>
      </div>
      
      {windows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No optimal windows available</p>
          <p className="text-sm">Check back later for updated recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {windows.map((window, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getConfidenceColor(window.confidence)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">
                    {window.startHour}:00 - {window.endHour}:00
                  </h3>
                  <p className="text-sm opacity-75">
                    {window.reason}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {getConfidenceText(window.confidence)} Confidence
                  </div>
                  <div className="text-xs opacity-75">
                    {(window.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-current opacity-60"
                  style={{ width: `${window.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Schedule your high-power devices during these optimal windows 
          to maximize your renewable energy usage and minimize grid dependency.
        </p>
      </div>
    </div>
  )
}

export default RecommendedWindows
