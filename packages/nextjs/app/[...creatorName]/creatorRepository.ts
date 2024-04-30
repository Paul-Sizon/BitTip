interface CreatorData {
    image: string;
    name: string;
    description: string;
    creatorWalletAddress: string;
  }
  
  const creatorDatabase: { [key: string]: CreatorData } = {
    'sofia': {
      image: 'https://avatars.githubusercontent.com/u/60684840?v=4',
      name: 'Sofia',
      description: "I'm a revit wizard🪄",
      creatorWalletAddress: '0xdb56D8f4171EA4D9D06C66600630c7376a790244',
    },
    'john': {
      image: 'https://avatars.githubusercontent.com/u/60684841?v=4',
      name: 'John',
      description: 'I am an artist',
      creatorWalletAddress: '0xdb56D8f4171EA4D9D06C66600630c7376a790244',
    },
    'pablo': {
      image: 'https://avatars.githubusercontent.com/u/60684842?v=4',
      name: 'Pablo',
      description: 'I am a web3 developer👨‍💻',
      creatorWalletAddress: '0xdb56D8f4171EA4D9D06C66600630c7376a790244',
    },
  };
  
  export const getCreatorData = (creatorName: string): CreatorData | undefined => {
    return creatorDatabase[creatorName.toLowerCase()];
  };