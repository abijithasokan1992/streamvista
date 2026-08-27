import PyOpenColorIO as OCIO

# Note: CreateRaw() is a basic config, real-world usage usually loads a config.ocio file
config = OCIO.Config.CreateRaw()

try:
    # Attempting to get a processor for Rec709 to ACEScg
    # Note: These colorspaces must exist in the config. 
    # CreateRaw() might not have them by default without manual addition.
    processor = config.getProcessor("Rec.709", "ACES - ACEScg")
    print(processor)
except Exception as e:
    print(f"Processor creation failed (as expected with Raw config): {e}")
    print("Available colorspaces in Raw config:", [cs.getName() for cs in config.getColorSpaces()])
