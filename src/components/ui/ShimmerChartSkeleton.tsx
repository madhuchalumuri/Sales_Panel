import React from "react";

interface ShimmerChartSkeletonProps {
  table?: boolean;
  title?: boolean;
  container?: boolean;
  card?: boolean;
  col?: boolean;
  dashboardCards?: boolean;
  form?: boolean;
}

const ShimmerChartSkeleton: React.FC<ShimmerChartSkeletonProps> = ({
  table = false,
  title = false,
  container = false,
  card = false,
  col = false,
  dashboardCards = false,
  form = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Title bar shimmer */}
      {title && <div className="h-4 w-40 shimmer rounded"></div>}

      {/* Large chart box shimmer */}
      {container && <div className="h-64 w-full shimmer rounded-xl"></div>}

      {/* Form box shimmer */}
      {form && <div className="h-96 w-full shimmer rounded-xl"></div>}

      {/* Dashboard Card shimmer */}
      {dashboardCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 sm:h-52 md:h-64 lg:h-64 shimmer rounded-2xl w-full"
            ></div>
          ))}
        </div>
      )}

      {/* Card shimmer */}
      {card && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-6 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 w-full shimmer rounded-2xl"></div>
          ))}
        </div>
      )}

      {/* X-axis labels shimmer */}
      {col && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full shimmer rounded-2xl"></div>
          ))}
        </div>
      )}

      {/* Table shimmer */}
      {table && (
        <div className="flex flex-col justify-between gap-2 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 w-full shimmer rounded-2xl"></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShimmerChartSkeleton;
