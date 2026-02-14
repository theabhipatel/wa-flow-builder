export const exportFlow = (nodes: any[], edges: any[]) => {
  const flowData = { nodes, edges };
  const dataStr = JSON.stringify(flowData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flow.json";
  link.click();
  URL.revokeObjectURL(url);
};

export const importFlow = (callback: (nodes: any[], edges: any[]) => void) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const flowData = JSON.parse(event.target.result);
          callback(flowData.nodes || [], flowData.edges || []);
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};
