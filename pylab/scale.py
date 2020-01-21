#!/usr/bin/env python3

def scale(x, a1, a2, b1, b2):
    return (b2-b1)*(x-a1)/(a2-a1) + b1

def main():
    
    r = range(0,10)

    print([scale(x+3, 3, 13, 50, 30) for x in r])
    

if __name__ == "__main__":
    main()
