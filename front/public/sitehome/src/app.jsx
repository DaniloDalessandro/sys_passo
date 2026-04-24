// Root app — wires everything together

const { useState: useStateApp } = React;

function App() {
  const [config] = useStateApp(MOCK_CONFIG);
  const [modal, setModal] = useStateApp(null);
  const [vehicle, setVehicle] = useStateApp(null);
  const { tweaks, setTweaks, visible: tweaksVisible, close: closeTweaks } = useTweaks();

  const onOpenModal = (kind) => setModal(kind);
  const onCloseModal = () => setModal(null);

  const onPlateSelect = async (plate) => {
    const res = await simulateApi(() => fetchVehicleByPlate(plate), 400);
    if (res) setVehicle(res);
  };

  return (
    <>
      <Navbar config={config} onOpenModal={onOpenModal} />
      <Hero config={config} onPlateSelect={onPlateSelect} onOpenModal={onOpenModal} />
      <Trust />
      <About config={config} />
      <Services onOpenModal={onOpenModal} />
      <Complaint onOpenModal={onOpenModal} />
      <HowItWorks />
      <FaqSection />
      <Contact config={config} />
      <Footer config={config} />

      <Modals open={modal} onClose={onCloseModal} />
      <VehicleResult data={vehicle} onClose={() => setVehicle(null)} />
      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} visible={tweaksVisible} onClose={closeTweaks} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
