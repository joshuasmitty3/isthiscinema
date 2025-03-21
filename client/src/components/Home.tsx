<div className="relative bg-background/80 px-4 py-14 shadow-xl shadow-slate-100/10 backdrop-blur-sm">
        <WatchList onListsChange={() => {
          // This will trigger a refresh of the lists
          refetchMovies();
        }} />
      </div>