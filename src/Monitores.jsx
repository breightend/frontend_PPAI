import { useEffect } from "react";

export default function Monitores() {
  useEffect(() => {
    const monitoresData = async () => {
      try {
        const data = await fetchData("/monitores");
        console.log("Monitores data:", data);
      } catch (error) {
        console.error("Error fetching monitores data:", error);
      }
    };

    monitoresData();
  }, []);

  return (
    <>
      <h1>Monitores</h1>
    </>
  );
}
